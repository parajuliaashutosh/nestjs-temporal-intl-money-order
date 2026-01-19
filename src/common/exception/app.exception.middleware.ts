import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RestResponse } from '../response-type/rest/rest-response';
import { AppException } from './app.exception';
import { AppExceptionStatus } from './app.expection.defination';

@Catch(AppException)
export class AppExceptionFilter implements ExceptionFilter {
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

    if (exception instanceof AppException) {
      const statusCode = exception.status;
      const message = exception.message;

      let status: number;

      switch (statusCode) {
        case AppExceptionStatus.FORBIDDEN:
          status = HttpStatus.FORBIDDEN;
          break;
        case AppExceptionStatus.UNAUTHORIZED:
          status = HttpStatus.UNAUTHORIZED;
          break;
        case AppExceptionStatus.NOT_FOUND:
          status = HttpStatus.NOT_FOUND;
          break;
        case AppExceptionStatus.CONFLICT:
          status = HttpStatus.CONFLICT;
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      const standardResponse = RestResponse.builder()
        .setSuccess(false)
        .setMessage(message)
        .build();

      response.status(status).json(standardResponse);
    }
  }
}
