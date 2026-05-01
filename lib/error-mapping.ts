import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  ValidationError,
  NotFoundError,
  GmailApiError,
  TokenExpiredError,
  QuotaExceededError,
} from "./errors";

export function handleApiError(error: unknown, context?: string): never {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("401") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("invalid credentials")
    ) {
      const authError = new AuthenticationError(error.message, { originalError: error.message });
      if (context) authError.context = { ...authError.context, context };
      throw authError;
    }

    if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
      const authzError = new AuthorizationError(error.message, { originalError: error.message });
      if (context) authzError.context = { ...authzError.context, context };
      throw authzError;
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      const notFoundError = new NotFoundError(error.message, { originalError: error.message });
      if (context) notFoundError.context = { ...notFoundError.context, context };
      throw notFoundError;
    }

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota exceeded")
    ) {
      const quotaError = new QuotaExceededError(error.message, { originalError: error.message });
      if (context) quotaError.context = { ...quotaError.context, context };
      throw quotaError;
    }

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("econnrefused")
    ) {
      const networkError = new NetworkError(error.message, { originalError: error.message });
      if (context) networkError.context = { ...networkError.context, context };
      throw networkError;
    }

    if (errorMessage.includes("token") && errorMessage.includes("expired")) {
      const tokenError = new TokenExpiredError(error.message, { originalError: error.message });
      if (context) tokenError.context = { ...tokenError.context, context };
      throw tokenError;
    }

    if (errorMessage.includes("invalid") && errorMessage.includes("request")) {
      const validationError = new ValidationError(error.message, { originalError: error.message });
      if (context) validationError.context = { ...validationError.context, context };
      throw validationError;
    }

    const apiError = new GmailApiError(error.message, { originalError: error.message });
    if (context) apiError.context = { ...apiError.context, context };
    throw apiError;
  }

  const apiError = new GmailApiError(String(error), { originalError: String(error) });
  if (context) apiError.context = { ...apiError.context, context };
  throw apiError;
}
