interface AppErrorOptions {
  code?: string;
}

/** An expected service error that the HTTP error handler can safely classify. */
export default class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly isOperational = true;

  constructor(message: string, statusCode: number, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code;
    Error.captureStackTrace(this, AppError);
  }
}
