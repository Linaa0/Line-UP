import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { hashOtp, otpCode } from '../common/codes.js';
import { addMinutes } from '../common/kigali-time.js';
import { hashPassword, verifyPassword } from '../common/password.js';
import type { Env } from '../config/env.validation.js';
import { PrismaService } from '../database/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { toUserView } from '../users/user.view.js';
import type { LoginInput, RegisterInput, ResetPasswordInput, VerifyInput } from './auth.schemas.js';

const OTP_TTL_MIN = 10;
const OTP_RESEND_SECONDS = 45;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly notifications: NotificationsService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { phone: input.phone } });
    if (existing?.phoneVerified) {
      throw new ConflictException('An account with this phone number already exists. Log in instead.');
    }
    const passwordHash = await hashPassword(input.password);
    const user = existing
      ? await this.prisma.user.update({ where: { id: existing.id }, data: { fullName: input.fullName, passwordHash } })
      : await this.prisma.user.create({ data: { fullName: input.fullName, phone: input.phone, passwordHash } });
    return this.issueOtp(user.id, user.phone, { enforceCooldown: false });
  }

  async resendOtp(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('No account uses this phone number.');
    return this.issueOtp(user.id, user.phone, { enforceCooldown: true });
  }

  async verify(input: VerifyInput) {
    const user = await this.prisma.user.findUnique({ where: { phone: input.phone } });
    if (!user) throw new NotFoundException('No account uses this phone number.');
    await this.consumeOtp(user.id, input.code);

    const verified = user.phoneVerified
      ? user
      : await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    if (!user.phoneVerified) {
      await this.notifications.create(user.id, {
        type: 'ACCOUNT',
        title: `Murakaza neza, ${verified.fullName.split(' ')[0]}!`,
        body: 'Your LINE-UP account is ready. Search a route to buy your first ticket.',
      });
    }
    return this.session(verified.id);
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { phone: input.phone } });
    const ok = user ? await verifyPassword(input.password, user.passwordHash) : false;
    if (!user || !ok) throw new UnauthorizedException('Phone number or password is incorrect.');
    if (!user.phoneVerified) {
      const otp = await this.issueOtp(user.id, user.phone, { enforceCooldown: false });
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PHONE_NOT_VERIFIED',
        message: 'Verify your phone number to finish setting up your account.',
        ...otp,
      });
    }
    return this.session(user.id);
  }

  async forgotPassword(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('No account uses this phone number.');
    return this.issueOtp(user.id, user.phone, { enforceCooldown: true });
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await this.prisma.user.findUnique({ where: { phone: input.phone } });
    if (!user) throw new NotFoundException('No account uses this phone number.');
    await this.consumeOtp(user.id, input.code);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.password), phoneVerified: true },
    });
    return this.session(user.id);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { homeStop: true } });
    if (!user) throw new UnauthorizedException('Your account no longer exists.');
    return toUserView(user);
  }

  private async session(userId: string) {
    const token = await this.jwt.signAsync({ sub: userId });
    return { token, user: await this.me(userId) };
  }

  private async issueOtp(userId: string, phone: string, { enforceCooldown }: { enforceCooldown: boolean }) {
    if (enforceCooldown) {
      const last = await this.prisma.otpCode.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      const waited = last ? (Date.now() - last.createdAt.getTime()) / 1000 : Infinity;
      if (waited < OTP_RESEND_SECONDS) {
        throw new HttpException(
          `Wait ${Math.ceil(OTP_RESEND_SECONDS - waited)} seconds before requesting a new code.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    const code = otpCode();
    const expiresAt = addMinutes(new Date(), OTP_TTL_MIN);
    await this.prisma.otpCode.create({
      data: { userId, codeHash: hashOtp(code, this.config.get('JWT_SECRET', { infer: true })), expiresAt },
    });
    // No SMS provider is integrated yet. In demo mode the code is returned so the
    // app can display it, clearly labelled. In production this must be sent by SMS.
    const demo = this.config.get('OTP_DEMO_MODE', { infer: true });
    return {
      phone,
      expiresAt,
      resendAfterSeconds: OTP_RESEND_SECONDS,
      ...(demo ? { demoCode: code } : {}),
    };
  }

  private async consumeOtp(userId: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { userId, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new UnauthorizedException('This code has expired. Request a new one.');
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw new UnauthorizedException('Too many wrong attempts. Request a new code.');
    }
    const matches = otp.codeHash === hashOtp(code, this.config.get('JWT_SECRET', { infer: true }));
    if (!matches) {
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new UnauthorizedException('That code is not correct. Check it and try again.');
    }
    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  }
}
