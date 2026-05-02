import crypto from "crypto";
import { AuthorizationError } from "@/lib/errors";
import { HTTP_AUTH_SCHEME } from "@/lib/sync/constants";

function getRequestHosts(headers: Headers): string[] {
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = headers.get("host")?.trim();

  return [forwardedHost, host].filter((value): value is string => Boolean(value));
}

export function assertSameOrigin(headers: Headers) {
  const origin = headers.get("origin");
  const hosts = getRequestHosts(headers);

  if (!origin || hosts.length === 0) {
    throw new AuthorizationError("Invalid request origin");
  }

  try {
    const originHost = new URL(origin).host;
    if (!hosts.includes(originHost)) {
      throw new AuthorizationError("Invalid request origin");
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw error;
    }
    throw new AuthorizationError("Invalid request origin");
  }
}

export function constantTimeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function hasBearerToken(headers: Headers, expectedToken: string | undefined): boolean {
  if (!expectedToken) {
    return false;
  }

  const authorization = headers.get("authorization");
  const prefix = `${HTTP_AUTH_SCHEME} `;
  if (!authorization?.startsWith(prefix)) {
    return false;
  }

  return constantTimeEquals(authorization.slice(prefix.length), expectedToken);
}
