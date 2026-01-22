import { AppExceptionBuilder, AppExceptionStatus } from "./app.expection.defination";

export class AppException extends Error {
  public readonly status: AppExceptionStatus;

  private constructor(message: string, status: AppExceptionStatus) {
    super(message);
    this.message = message;
    this.status = status;
  }

  static builder(): AppExceptionBuilder {
    return new (class {
      private message!: string;
      private status!: AppExceptionStatus;

      setMessage(message: string): this {
        this.message = message;
        return this;
      }

      setStatus(status: AppExceptionStatus): this {
        this.status = status;
        return this;
      }

      build(): AppException {
        return new AppException(this.message, this.status);
      }
    })();
  }

  static forbidden(message: string): AppException {
    return AppException.builder()
      .setMessage(message)
      .setStatus(AppExceptionStatus.FORBIDDEN)
      .build();
  }

  static unauthorized(message: string): AppException {
    return AppException.builder()
      .setMessage(message)
      .setStatus(AppExceptionStatus.UNAUTHORIZED)
      .build();
  }

  static notFound(message: string): AppException {
    return AppException.builder()
      .setMessage(message)
      .setStatus(AppExceptionStatus.NOT_FOUND)
      .build();
  }

  static conflict(message: string): AppException {
    return AppException.builder()
      .setMessage(message)
      .setStatus(AppExceptionStatus.CONFLICT)
      .build();
  }

  static badRequest(message: string): AppException {
    return AppException.builder()
      .setMessage(message)
      .setStatus(AppExceptionStatus.BAD_REQUEST)
      .build();
  }

  static internalServerError(message: string): AppException {
    return AppException.builder()
      .setMessage(message)
      .setStatus(AppExceptionStatus.INTERNAL_SERVER_ERROR)
      .build();
  }
}
