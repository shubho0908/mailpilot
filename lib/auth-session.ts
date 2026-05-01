import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { GmailAuth, GmailClientAuth } from "@/services/gmail/gmail.types";
import type { Credentials } from "google-auth-library";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { isAppError, AuthError, isAuthError } from "@/lib/errors";

const logger = createLogger("auth:utils");

export async function getCurrentSession(headers?: Headers) {
  return auth.api.getSession({
    headers: headers ?? (await nextHeaders()),
  });
}

export async function requireGmailAuth(headers: Headers): Promise<{
  auth: GmailAuth;
  userId: string;
}> {
  const session = await getCurrentSession(headers);

  if (!session) {
    throw new AuthError("Unauthorized", "UNAUTHORIZED");
  }

  const accounts = await db.query.account.findMany({
    where: eq(account.userId, session.user.id),
  });

  const googleAccount = accounts.find((acc) => acc.providerId === "google");

  if (!googleAccount || !googleAccount.accessToken) {
    logger.warn("No Google access token found for user", { userId: session.user.id });
    throw new AuthError("No Google access token found", "NO_ACCESS_TOKEN");
  }

  const now = new Date();
  const tokenExpiry = googleAccount.accessTokenExpiresAt
    ? new Date(googleAccount.accessTokenExpiresAt)
    : null;
  const isExpired = tokenExpiry && tokenExpiry < now;

  if (isExpired && !googleAccount.refreshToken) {
    logger.warn("Google access token expired without refresh token", {
      userId: session.user.id,
    });
    throw new AuthError("Access token expired, please re-authenticate", "TOKEN_EXPIRED");
  }

  const auth: GmailClientAuth = {
    accessToken: googleAccount.accessToken,
    refreshToken: googleAccount.refreshToken || undefined,
    onTokens: async (tokens: Credentials) => {
      try {
        if (tokens.access_token) {
          const expiresAt = tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : new Date(Date.now() + 3600 * 1000);

          await db
            .update(account)
            .set({
              accessToken: tokens.access_token,
              accessTokenExpiresAt: expiresAt,
              refreshToken: tokens.refresh_token || googleAccount.refreshToken,
            })
            .where(eq(account.id, googleAccount.id));

          logger.info("Access token refreshed and persisted to database", {
            userId: session.user.id,
          });
        }
      } catch (error) {
        logger.error("Failed to persist refreshed token to database", error, {
          userId: session.user.id,
        });
      }
    },
  };

  return {
    auth,
    userId: session.user.id,
  };
}

export function handleAuthError(error: unknown): NextResponse {
  if (isAppError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  if (isAuthError(error)) {
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.code === "NO_ACCESS_TOKEN") {
      return NextResponse.json({ error: "No Google access token found" }, { status: 401 });
    }
    if (error.code === "TOKEN_EXPIRED") {
      return NextResponse.json(
        { error: "Access token expired, please re-authenticate" },
        { status: 401 }
      );
    }
  }
  return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
}
