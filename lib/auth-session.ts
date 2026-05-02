import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { GmailAuth, GmailClientAuth } from "@/services/gmail/gmail.types";
import type { Credentials } from "google-auth-library";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { isAppError, AuthError, AuthErrorCode, isAuthError } from "@/lib/errors";

const logger = createLogger("auth:utils");
const GOOGLE_PROVIDER_ID = "google";

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
    throw new AuthError("Unauthorized", AuthErrorCode.Unauthorized);
  }

  const auth = await getGmailAuthForUserId(session.user.id);

  return {
    auth,
    userId: session.user.id,
  };
}

export async function getGmailAuthForUserId(userId: string): Promise<GmailAuth> {
  const accounts = await db.query.account.findMany({
    where: eq(account.userId, userId),
  });

  const googleAccount = accounts.find((acc) => acc.providerId === GOOGLE_PROVIDER_ID);

  if (!googleAccount || !googleAccount.accessToken) {
    logger.warn("No Google access token found for user", { userId });
    throw new AuthError("No Google access token found", AuthErrorCode.NoAccessToken);
  }

  const now = new Date();
  const tokenExpiry = googleAccount.accessTokenExpiresAt
    ? new Date(googleAccount.accessTokenExpiresAt)
    : null;
  const isExpired = tokenExpiry && tokenExpiry < now;

  if (isExpired && !googleAccount.refreshToken) {
    logger.warn("Google access token expired without refresh token", {
      userId,
    });
    throw new AuthError("Access token expired, please re-authenticate", AuthErrorCode.TokenExpired);
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
            userId,
          });
        }
      } catch (error) {
        logger.error("Failed to persist refreshed token to database", error, {
          userId,
        });
      }
    },
  };

  return auth;
}

export function handleAuthError(error: unknown): NextResponse {
  if (isAppError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  if (isAuthError(error)) {
    if (error.code === AuthErrorCode.Unauthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.code === AuthErrorCode.NoAccessToken) {
      return NextResponse.json({ error: "No Google access token found" }, { status: 401 });
    }
    if (error.code === AuthErrorCode.TokenExpired) {
      return NextResponse.json(
        { error: "Access token expired, please re-authenticate" },
        { status: 401 }
      );
    }
  }
  return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
}
