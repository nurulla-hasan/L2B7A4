export type TErrorDetails = {
  path: string | number;
  message: string;
}[];

class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorDetails?: TErrorDetails;

  constructor(statusCode: number, message: string, errorDetails?: TErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorDetails = errorDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
