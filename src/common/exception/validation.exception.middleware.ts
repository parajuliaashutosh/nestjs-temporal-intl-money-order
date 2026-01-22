import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { RestResponse } from '../response-type/rest/rest-response';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.getType();

    switch (ctx) {
      case 'http':
        this.handleHttpException(exception, host);
        break;
      default:
        // No-op for other contexts
        break;
    }
  }

  private handleHttpException(
    exception: BadRequestException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const res = exception.getResponse();
    const validationErrors = Array.isArray(res['message'])
      ? res['message']
      : [];

    const formattedErrors = this.formatValidationErrors(
      validationErrors as ValidationError[],
    );

    if (exception instanceof BadRequestException) {
      const standardResponse = RestResponse.builder()
        .setSuccess(false)
        .setMessage('Validation failed')
        .setErrors(formattedErrors)
        .build();

      response.status(HttpStatus.BAD_REQUEST).json(standardResponse);
    }
  }

  private formatValidationErrors(
    errors: ValidationError[],
  ): { field?: string; message: string }[] {
    const result: { field?: string; message: string }[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        const firstKey = Object.keys(error.constraints)[0];
        result.push({
          field: error.property,
          message: error.constraints[firstKey],
        });
      }

      if (error.children && error.children.length > 0) {
        const childErrors = this.formatValidationErrors(error.children);
        childErrors.forEach((child) => {
          // prepend parent property for nested errors
          result.push({
            field: `${error.property}.${child.field}`,
            message: child.message,
          });
        });
      }
    });

    return result;
  }
}
