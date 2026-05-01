import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";

const GOOGLE_GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
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
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: true,
      accessType: "offline",
      prompt: "select_account consent",
      scope: GOOGLE_GMAIL_SCOPES,
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    generateId: () => crypto.randomUUID(),
  },
  onAPIError: {
    throw: false,
    errorURL: "/",
  },
});
