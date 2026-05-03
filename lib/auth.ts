import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { RuntimeEnvironment } from "@/lib/sync/constants";

const GOOGLE_GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

export const auth = betterAuth({
  baseURL: requireEnv("BETTER_AUTH_URL"),
  secret: process.env.BETTER_AUTH_SECRET || crypto.randomUUID(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      enabled: true,
      accessType: "offline",
      prompt: "select_account",
      scope: GOOGLE_GMAIL_SCOPES,
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    generateId: () => crypto.randomUUID(),
    cookies: {
      sessionToken: {
        name: "better-auth.session_token",
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === RuntimeEnvironment.Production,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        },
      },
    },
  },
  onAPIError: {
    throw: false,
    errorURL: "/",
  },
});
