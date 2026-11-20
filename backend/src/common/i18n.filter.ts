import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';

import { pickLang, translateMessage } from './i18n.js';

/**
 * Sends HTTP errors in the client's language (Accept-Language: en, rw, fr, sw).
 * Validation messages arrive as "field: message"; only the message part is translated.
 */
@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const lang = pickLang(ctx.getRequest<Request>().headers['accept-language']);
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const body: Record<string, unknown> =
      typeof raw === 'string' ? { statusCode: status, message: raw } : { ...(raw as Record<string, unknown>) };

    const translate = (m: unknown) => {
      if (typeof m !== 'string') return m;
      const field = m.match(/^([\w.]+): (.*)$/s);
      return field ? `${field[1]}: ${translateMessage(field[2], lang)}` : translateMessage(m, lang);
    };
    body.message = Array.isArray(body.message) ? body.message.map(translate) : translate(body.message);

    ctx.getResponse<Response>().status(status).json(body);
  }
}
