import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  GmailApiError,
  TokenExpiredError,
  QuotaExceededError,
  ErrorCode,
  isAppError,
} from "./errors";

interface GmailError {
  code?: number;
  errors?: Array<{
    message: string;
    reason: string;
    domain: string;
  }>;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGmailErrorArray(errors: unknown): errors is GmailError["errors"] {
  return (
    Array.isArray(errors) &&
    errors.every(
      (e) => typeof e === "object" && e !== null && "message" in e && "reason" in e && "domain" in e
    )
  );
}

function getGoogleApiError(error: unknown): GmailError | undefined {
  if (!isRecord(error)) return undefined;

  const response = isRecord(error.response) ? error.response : undefined;
  const data = isRecord(response?.data) ? response.data : undefined;
  const nestedError = isRecord(data?.error) ? data.error : undefined;
  const errors = Array.isArray(nestedError?.errors)
    ? nestedError.errors
    : Array.isArray(data?.errors)
      ? data.errors
      : undefined;
  const message =
    typeof nestedError?.message === "string"
      ? nestedError.message
      : typeof data?.message === "string"
        ? data.message
        : error instanceof Error
          ? error.message
          : "Gmail API request failed";
  const code =
    typeof nestedError?.code === "number"
      ? nestedError.code
      : typeof data?.code === "number"
        ? data.code
        : typeof response?.status === "number"
          ? response.status
          : undefined;

  if (!code && !errors && !message) return undefined;

  return {
    code,
    errors: isGmailErrorArray(errors) ? errors : undefined,
    message,
  };
}

export function mapGmailError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  const googleApiError = getGoogleApiError(error);
  if (googleApiError) {
    const code = getErrorCodeFromGmailError(googleApiError);
    const context = {
      originalError: googleApiError.message,
      gmailCode: googleApiError.code,
      gmailReason: googleApiError.errors?.[0]?.reason,
    };

    switch (code) {
      case ErrorCode.AUTHENTICATION_FAILED:
        return new AuthenticationError(googleApiError.message, context);
      case ErrorCode.AUTHORIZATION_FAILED:
        return new AuthorizationError(googleApiError.message, context);
      case ErrorCode.RESOURCE_NOT_FOUND:
        return new NotFoundError(googleApiError.message, context);
      case ErrorCode.QUOTA_EXCEEDED:
        return new QuotaExceededError(googleApiError.message, context);
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return new RateLimitError(googleApiError.message, context);
      case ErrorCode.INVALID_REQUEST:
        return new ValidationError(googleApiError.message, context);
      default:
        return new GmailApiError(googleApiError.message, context);
    }
  }

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("401") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("invalid credentials")
    ) {
      return new AuthenticationError(error.message, { originalError: error.message });
    }

    if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
      return new AuthorizationError(error.message, { originalError: error.message });
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return new NotFoundError(error.message, { originalError: error.message });
    }

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota exceeded")
    ) {
      return new QuotaExceededError(error.message, { originalError: error.message });
    }

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("econnrefused")
    ) {
      return new NetworkError(error.message, { originalError: error.message });
    }

    if (errorMessage.includes("token") && errorMessage.includes("expired")) {
      return new TokenExpiredError(error.message, { originalError: error.message });
    }

    if (errorMessage.includes("invalid") && errorMessage.includes("request")) {
      return new ValidationError(error.message, { originalError: error.message });
    }

    return new GmailApiError(error.message, { originalError: error.message });
  }

  return new GmailApiError(String(error), { originalError: String(error) });
}

export function getErrorCodeFromGmailError(error: GmailError): ErrorCode {
  const reason = error.errors?.[0]?.reason;

  if (error.code === 401 || reason === "authError" || reason === "invalidCredentials") {
    return ErrorCode.AUTHENTICATION_FAILED;
  }

  if (error.code === 403 || reason === "forbidden" || reason === "insufficientPermissions") {
    return ErrorCode.AUTHORIZATION_FAILED;
  }

  if (error.code === 404 || reason === "notFound") {
    return ErrorCode.RESOURCE_NOT_FOUND;
  }

  if (error.code === 429 || reason === "quotaExceeded") {
    return ErrorCode.QUOTA_EXCEEDED;
  }

  if (reason === "rateLimitExceeded" || reason === "userRateLimitExceeded") {
    return ErrorCode.RATE_LIMIT_EXCEEDED;
  }

  if (error.code === 400 || reason === "invalidArgument") {
    return ErrorCode.INVALID_REQUEST;
  }

  if (reason === "preconditionFailed" || error.message?.toLowerCase().includes("precondition")) {
    return ErrorCode.AUTHENTICATION_FAILED;
  }

  return ErrorCode.GMAIL_API_ERROR;
}

export function handleApiError(error: unknown, context?: string): never {
  const mappedError = mapGmailError(error);
  if (context) {
    mappedError.context = { ...mappedError.context, context };
  }
  throw mappedError;
}
