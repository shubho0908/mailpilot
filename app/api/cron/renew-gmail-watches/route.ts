import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { gmailSyncState } from "@/db/schema";
import { getGmailAuthForUserId } from "@/lib/auth-session";
import { createLogger } from "@/lib/logger";
import {
  CRON_RENEWAL_WINDOW_MS,
  GMAIL_SYNC_ENV,
  HTTP_AUTH_SCHEME,
  RuntimeEnvironment,
} from "@/lib/sync/constants";
import { setupGmailWatch } from "@/services/gmail/gmail.sync";

const logger = createLogger("api:cron:renew-gmail-watches");

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env[GMAIL_SYNC_ENV.cronSecret];
  if (!secret) {
    return process.env.NODE_ENV !== RuntimeEnvironment.Production;
  }

  return request.headers.get("authorization") === `${HTTP_AUTH_SCHEME} ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const renewalDeadline = new Date(Date.now() + CRON_RENEWAL_WINDOW_MS);
  const expiringStates = await db
    .select()
    .from(gmailSyncState)
    .where(
      or(
        isNull(gmailSyncState.watchExpiration),
        lte(gmailSyncState.watchExpiration, renewalDeadline)
      )
    );

  const results = await Promise.allSettled(
    expiringStates.map(async (state) => {
      const auth = await getGmailAuthForUserId(state.userId);
      const watch = await setupGmailWatch(auth);
      const now = new Date();

      await db
        .update(gmailSyncState)
        .set({
          emailAddress: watch.emailAddress,
          historyId: watch.historyId,
          watchExpiration: watch.expiration,
          updatedAt: now,
        })
        .where(eq(gmailSyncState.userId, state.userId));

      return {
        userId: state.userId,
        emailAddress: watch.emailAddress,
        watchExpiration: watch.expiration?.toISOString() ?? null,
      };
    })
  );

  const renewed = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - renewed;

  if (failed > 0) {
    logger.warn("Some Gmail watch renewals failed", { renewed, failed });
  }

  return NextResponse.json({ renewed, failed });
}
