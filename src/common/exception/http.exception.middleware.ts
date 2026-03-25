import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RestResponse } from '../response-type/rest/rest-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.getType();

    switch (ctx) {
      case 'http':
        this.handleHttpException(exception, host);
        break;
      default:
        Logger.error(
          `Unhandled exception context: ${ctx}`,
          (exception as Error).stack,
        );
    }
  }

  handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message = exception.message;
      let errors: Array<{ field?: string; message: string }> | undefined;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as {
          message?: string | string[];
          [key: string]: any;
        };
        if (Array.isArray(res.message)) {
          errors = res.message.map((msg) => ({ message: msg }));
          message = 'Validation failed';
        } else {
          message = res.message || exception.message;
        }
      }

      const builder = RestResponse.builder()
        .setSuccess(false)
        .setMessage(message);

      if (errors) {
        builder.setErrors(errors);
      }

      const standardResponse = builder.build();

      response.status(status).json(standardResponse);
    } else {
      // Fallback for non-HttpException
      const standardResponse = RestResponse.builder()
        .setSuccess(false)
        .setMessage('An unexpected error occurred')
        .build();

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(standardResponse);
    }
  }
}
