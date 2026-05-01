import type { gmail_v1 } from "googleapis";
import { google } from "googleapis";
import { OAuth2Client, type Credentials } from "google-auth-library";
import { createLogger } from "@/lib/logger";
import type { GmailAuth, GmailClientAuth } from "./gmail.types";

const logger = createLogger("gmail.client");

function requireGoogleOAuthConfig(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured");
  }

  return { clientId, clientSecret };
}

function normalizeAuth(auth: GmailAuth): GmailClientAuth {
  return typeof auth === "string" ? { accessToken: auth } : auth;
}

function createOAuth2Client(auth: GmailAuth): OAuth2Client {
  const { clientId, clientSecret } = requireGoogleOAuthConfig();
  const credentials = normalizeAuth(auth);
  const oauth2Client = new OAuth2Client(clientId, clientSecret);

  const googleCredentials: Credentials = {
    access_token: credentials.accessToken,
  };

  if (credentials.refreshToken) {
    googleCredentials.refresh_token = credentials.refreshToken;
  }

  oauth2Client.setCredentials(googleCredentials);
  return oauth2Client;
}

export async function getGmailClient(auth: GmailAuth): Promise<gmail_v1.Gmail> {
  const credentials = normalizeAuth(auth);
  const oauth2Client = createOAuth2Client(credentials);

  if (credentials.refreshToken) {
    try {
      const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
      logger.info("Access token refreshed successfully", {
        hasAccessToken: !!newCredentials.access_token,
      });
    } catch (error) {
      logger.error("Failed to refresh access token", error);
    }
  }

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      logger.info("New refresh token received", { hasRefreshToken: !!tokens.refresh_token });
    }
    if (tokens.access_token) {
      logger.info("New access token received", { hasAccessToken: !!tokens.access_token });
    }

    await credentials.onTokens?.(tokens);
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}
