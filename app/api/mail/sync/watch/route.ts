import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gmailSyncState } from "@/db/schema";
import { requireGmailAuth, handleAuthError } from "@/lib/auth-session";
import { createLogger } from "@/lib/logger";
import { WATCH_RENEWAL_WINDOW_MS } from "@/lib/sync/constants";
import { setupGmailWatch } from "@/services/gmail/gmail.sync";
import { assertSameOrigin } from "@/lib/request-auth";

const logger = createLogger("api:mail:sync:watch");

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request.headers);

    const { auth, userId } = await requireGmailAuth(request.headers);
    const [existingState] = await db
      .select()
      .from(gmailSyncState)
      .where(eq(gmailSyncState.userId, userId))
      .limit(1);

    if (
      existingState?.watchExpiration &&
      existingState.watchExpiration.getTime() > Date.now() + WATCH_RENEWAL_WINDOW_MS
    ) {
      return NextResponse.json({
        emailAddress: existingState.emailAddress,
        historyId: existingState.historyId,
        watchExpiration: existingState.watchExpiration.toISOString(),
        reused: true,
      });
    }

    const watch = await setupGmailWatch(auth);
    const now = new Date();

    await db
      .insert(gmailSyncState)
      .values({
        userId,
        emailAddress: watch.emailAddress,
        historyId: watch.historyId,
        watchExpiration: watch.expiration,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: gmailSyncState.userId,
        set: {
          emailAddress: watch.emailAddress,
          historyId: watch.historyId,
          watchExpiration: watch.expiration,
          updatedAt: now,
        },
      });

    logger.info("Gmail watch registered", {
      userId,
      emailAddress: watch.emailAddress,
      historyId: watch.historyId,
      watchExpiration: watch.expiration?.toISOString(),
    });

    return NextResponse.json({
      emailAddress: watch.emailAddress,
      historyId: watch.historyId,
      watchExpiration: watch.expiration?.toISOString() ?? null,
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return authError;
    }

    logger.error("Failed to register Gmail watch", error);
    return NextResponse.json({ error: "Failed to register Gmail watch" }, { status: 500 });
  }
}
