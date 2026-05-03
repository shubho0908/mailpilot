import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { db } from "@/db";
import { gmailSyncState } from "@/db/schema";
import { getGmailAuthForUserId } from "@/lib/auth-session";
import { createLogger } from "@/lib/logger";
import { GMAIL_SYNC_ENV, HTTP_AUTH_SCHEME } from "@/lib/sync/constants";
import { constantTimeEquals } from "@/lib/request-auth";
import { broadcastMailEvent } from "@/lib/sync/sse-bus";
import { listHistorySince } from "@/services/gmail/gmail.sync";
import type { GmailHistoryChangeSet } from "@/services/gmail/gmail.sync";

const logger = createLogger("api:webhooks:gmail");
const oauth2Client = new OAuth2Client();

const pubSubEnvelopeSchema = z.object({
  message: z.object({
    data: z.string().optional(),
    messageId: z.string().optional(),
    publishTime: z.string().optional(),
  }),
  subscription: z.string().optional(),
});

const gmailPushDataSchema = z.object({
  emailAddress: z.email(),
  historyId: z.union([z.string(), z.number()]).transform((val) => String(val)),
});

function verifyWebhookToken(request: NextRequest): boolean {
  const expectedToken = process.env[GMAIL_SYNC_ENV.pubSubVerificationToken];
  if (!expectedToken) return false;

  const queryToken = request.nextUrl.searchParams.get("token");
  const headerToken = request.headers.get("x-goog-channel-token");
  return (
    (queryToken ? constantTimeEquals(queryToken, expectedToken) : false) ||
    (headerToken ? constantTimeEquals(headerToken, expectedToken) : false)
  );
}

async function verifyPubSubOidc(request: NextRequest): Promise<boolean> {
  const audience = process.env[GMAIL_SYNC_ENV.pubSubAudience];
  const serviceAccountEmail = process.env[GMAIL_SYNC_ENV.pubSubServiceAccountEmail];
  if (!audience || !serviceAccountEmail) return false;

  const authorization = request.headers.get("authorization");
  const bearerPrefix = `${HTTP_AUTH_SCHEME} `;
  const token = authorization?.startsWith(bearerPrefix)
    ? authorization.slice(bearerPrefix.length)
    : null;
  if (!token) return false;

  const ticket = await oauth2Client.verifyIdToken({
    idToken: token,
    audience,
  });
  const payload = ticket.getPayload();

  return payload?.email === serviceAccountEmail && payload.email_verified === true;
}

async function authorizeWebhook(request: NextRequest): Promise<boolean> {
  if (verifyWebhookToken(request)) return true;
  try {
    if (await verifyPubSubOidc(request)) return true;
  } catch (error) {
    logger.warn("Failed to verify Pub/Sub OIDC token", {
      error: error instanceof Error ? error.message : "Unknown verification error",
    });
  }
  return false;
}

function decodePubSubData(data: string | undefined): unknown {
  if (!data) {
    throw new Error("Pub/Sub message is missing Gmail payload data");
  }

  const decoded = Buffer.from(data, "base64").toString("utf8");
  return JSON.parse(decoded);
}

function compareHistoryIds(a: string, b: string): number {
  try {
    const aNum = BigInt(a);
    const bNum = BigInt(b);
    return aNum > bNum ? 1 : aNum < bNum ? -1 : 0;
  } catch {
    return a.localeCompare(b);
  }
}

async function persistAndBroadcast({
  userId,
  emailAddress,
  historyId,
  changedAt,
  changes,
  fullRefresh,
}: {
  userId: string;
  emailAddress: string;
  historyId: string;
  changedAt: Date;
  changes: GmailHistoryChangeSet;
  fullRefresh?: boolean;
}) {
  await db
    .update(gmailSyncState)
    .set({ historyId, updatedAt: changedAt })
    .where(eq(gmailSyncState.userId, userId));

  broadcastMailEvent({
    type: "mail.changed",
    userId,
    emailAddress,
    historyId,
    messageIds: changes.messageIds,
    addedMessageIds: changes.addedMessageIds,
    deletedMessageIds: changes.deletedMessageIds,
    labelChangedMessageIds: changes.labelChangedMessageIds,
    fullRefresh,
    occurredAt: changedAt.toISOString(),
  });
}

function createEmptyChanges(historyId: string): GmailHistoryChangeSet {
  return {
    latestHistoryId: historyId,
    messageIds: [],
    addedMessageIds: [],
    deletedMessageIds: [],
    labelChangedMessageIds: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!(await authorizeWebhook(request))) {
      logger.warn("Rejected Gmail webhook with invalid verification token");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const envelope = pubSubEnvelopeSchema.parse(body);
    const pushData = gmailPushDataSchema.parse(decodePubSubData(envelope.message.data));

    const [syncState] = await db
      .select()
      .from(gmailSyncState)
      .where(eq(gmailSyncState.emailAddress, pushData.emailAddress))
      .limit(1);

    if (!syncState) {
      logger.warn("Received Gmail webhook for an unknown mailbox");
      return NextResponse.json({ ok: true, ignored: true });
    }

    const auth = await getGmailAuthForUserId(syncState.userId);
    const now = new Date();

    if (compareHistoryIds(pushData.historyId, syncState.historyId) <= 0) {
      logger.info("Ignored duplicate or stale Gmail webhook");
      return NextResponse.json({ ok: true, ignored: true });
    }

    try {
      const changes = await listHistorySince(auth, syncState.historyId);
      const latestHistoryId =
        compareHistoryIds(changes.latestHistoryId, pushData.historyId) > 0
          ? changes.latestHistoryId
          : pushData.historyId;

      await persistAndBroadcast({
        userId: syncState.userId,
        emailAddress: pushData.emailAddress,
        historyId: latestHistoryId,
        changedAt: now,
        changes,
      });

      logger.info("Processed Gmail webhook", {
        changedMessages: changes.messageIds.length,
        addedMessages: changes.addedMessageIds.length,
      });

      return NextResponse.json({ ok: true });
    } catch (error) {
      await persistAndBroadcast({
        userId: syncState.userId,
        emailAddress: pushData.emailAddress,
        historyId: pushData.historyId,
        changedAt: now,
        changes: createEmptyChanges(pushData.historyId),
        fullRefresh: true,
      });

      logger.error("Gmail history sync failed; requested full client refresh", error);

      return NextResponse.json({ ok: true, fullRefresh: true });
    }
  } catch (error) {
    logger.error("Invalid Gmail webhook payload", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
