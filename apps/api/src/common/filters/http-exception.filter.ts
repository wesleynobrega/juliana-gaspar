import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as any).message ?? message;
    } else {
      // 500 real: registrar a exceção para diagnóstico (antes era engolida em silêncio)
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
        exception instanceof Error ? exception.message : undefined,
      );
    }

    response.status(status).json({ statusCode: status, message, timestamp: new Date().toISOString() });
  }
}
