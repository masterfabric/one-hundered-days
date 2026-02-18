/**
 * Standard error response format
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): ApiError {
  if (error instanceof AppError) {
    return {
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: "Error",
      message: error.message || defaultMessage,
      statusCode: 500,
    };
  }

  return {
    error: "UnknownError",
    message: defaultMessage,
    statusCode: 500,
  };
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  UNAUTHORIZED: "You must be authenticated to perform this action",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Invalid input data",
  SERVER_ERROR: "An internal server error occurred",
  RATE_LIMIT: "Too many requests, please try again later",
} as const;

/**
 * Common HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  NOT_IMPLEMENTED: 501,
  INTERNAL_SERVER_ERROR: 500,
} as const;

