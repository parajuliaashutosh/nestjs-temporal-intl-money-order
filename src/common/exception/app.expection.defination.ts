import { AppException } from "./app.exception";

export enum AppExceptionStatus {
    GENERIC_ERROR = 'GENERIC_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export interface AppExceptionBuilder {
  setMessage(message: string): this;
  setStatus(status: AppExceptionStatus): this;
  build(): AppException;
}
