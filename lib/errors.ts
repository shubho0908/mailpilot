enum ErrorCode {
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  AUTHORIZATION_FAILED = "AUTHORIZATION_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  GMAIL_API_ERROR = "GMAIL_API_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", context?: Record<string, unknown>) {
    super(message, ErrorCode.AUTHENTICATION_FAILED, 401, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Authorization failed", context?: Record<string, unknown>) {
    super(message, ErrorCode.AUTHORIZATION_FAILED, 403, true, context);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.NETWORK_ERROR, 503, true, context);
    this.name = "NetworkError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid request", context?: Record<string, unknown>) {
    super(message, ErrorCode.INVALID_REQUEST, 400, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", context?: Record<string, unknown>) {
    super(message, ErrorCode.RESOURCE_NOT_FOUND, 404, true, context);
  }
}

export class GmailApiError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.GMAIL_API_ERROR, 500, true, context);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = "Token expired", context?: Record<string, unknown>) {
    super(message, ErrorCode.TOKEN_EXPIRED, 401, true, context);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = "Quota exceeded", context?: Record<string, unknown>) {
    super(message, ErrorCode.QUOTA_EXCEEDED, 429, true, context);
  }
}

type AuthErrorCode = "UNAUTHORIZED" | "NO_ACCESS_TOKEN" | "TOKEN_EXPIRED";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
