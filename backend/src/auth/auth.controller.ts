import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';

import { AuthGuard, UserId } from './auth.guard.js';
import {
  loginSchema,
  phoneSchema,
  registerSchema,
  resetPasswordSchema,
  verifySchema,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyInput,
} from './auth.schemas.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Creates an unverified account and sends (in demo mode: returns) a 6-digit code. */
  @Post('register')
  register(@Body({ schema: registerSchema }) body: RegisterInput) {
    return this.auth.register(body);
  }

  @Post('verify')
  @HttpCode(200)
  verify(@Body({ schema: verifySchema }) body: VerifyInput) {
    return this.auth.verify(body);
  }

  @Post('resend-code')
  @HttpCode(200)
  resend(@Body({ schema: phoneSchema }) body: { phone: string }) {
    return this.auth.resendOtp(body.phone);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body({ schema: loginSchema }) body: LoginInput) {
    return this.auth.login(body);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgot(@Body({ schema: phoneSchema }) body: { phone: string }) {
    return this.auth.forgotPassword(body.phone);
  }

  @Post('reset-password')
  @HttpCode(200)
  reset(@Body({ schema: resetPasswordSchema }) body: ResetPasswordInput) {
    return this.auth.resetPassword(body);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@UserId() userId: string) {
    return this.auth.me(userId);
  }
}
