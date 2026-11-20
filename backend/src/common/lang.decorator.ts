import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { type Lang, pickLang } from './i18n.js';

/** The client's language from the Accept-Language header (en, rw, fr or sw). */
export const ReqLang = createParamDecorator((_: unknown, ctx: ExecutionContext): Lang =>
  pickLang(ctx.switchToHttp().getRequest<Request>().headers['accept-language']),
);
