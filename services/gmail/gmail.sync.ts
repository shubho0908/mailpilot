import type { gmail_v1 } from "googleapis";
import { getGmailClient } from "./gmail.client";
import type { GmailAuth } from "./gmail.types";
import { createLogger } from "@/lib/logger";
import { mailLabelSchema } from "@/lib/mail/types";
import { GMAIL_SYNC_ENV, GmailHistoryType } from "@/lib/sync/constants";

const logger = createLogger("gmail.sync");

export interface GmailWatchResult {
  emailAddress: string;
  historyId: string;
  expiration?: Date;
}

export interface GmailHistoryChangeSet {
  latestHistoryId: string;
  messageIds: string[];
  addedMessageIds: string[];
  deletedMessageIds: string[];
  labelChangedMessageIds: string[];
}

function requireTopicName(): string {
  const topicName = process.env[GMAIL_SYNC_ENV.pubSubTopic];
  if (!topicName) {
    throw new Error(`${GMAIL_SYNC_ENV.pubSubTopic} is required to enable Gmail watch sync`);
  }
  return topicName;
}

function parseExpiration(expiration: string | null | undefined): Date | undefined {
  if (!expiration) return undefined;
  const date = new Date(Number(expiration));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function addMessageId(target: Set<string>, message?: gmail_v1.Schema$Message) {
  if (message?.id) {
    target.add(message.id);
  }
}

export async function setupGmailWatch(auth: GmailAuth): Promise<GmailWatchResult> {
  const gmail = await getGmailClient(auth);
  const [profile, watchResponse] = await Promise.all([
    gmail.users.getProfile({ userId: "me" }),
    gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: requireTopicName(),
        labelIds: [mailLabelSchema.enum.INBOX],
        labelFilterBehavior: "INCLUDE",
      },
    }),
  ]);

  if (!profile.data.emailAddress || !watchResponse.data.historyId) {
    throw new Error("Gmail watch setup returned incomplete sync metadata");
  }

  logger.info("Gmail watch setup completed", {
    emailAddress: profile.data.emailAddress,
    historyId: watchResponse.data.historyId,
    hasExpiration: !!watchResponse.data.expiration,
  });

  return {
    emailAddress: profile.data.emailAddress,
    historyId: watchResponse.data.historyId,
    expiration: parseExpiration(watchResponse.data.expiration),
  };
}

export async function listHistorySince(
  auth: GmailAuth,
  startHistoryId: string
): Promise<GmailHistoryChangeSet> {
  const gmail = await getGmailClient(auth);
  const allHistory: gmail_v1.Schema$History[] = [];
  let pageToken: string | undefined;
  let latestHistoryId = startHistoryId;

  do {
    const response = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      historyTypes: [
        GmailHistoryType.MessageAdded,
        GmailHistoryType.MessageDeleted,
        GmailHistoryType.LabelAdded,
        GmailHistoryType.LabelRemoved,
      ],
      pageToken,
    });

    allHistory.push(...(response.data.history || []));
    latestHistoryId = response.data.historyId || latestHistoryId;
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  const addedMessageIds = new Set<string>();
  const deletedMessageIds = new Set<string>();
  const labelChangedMessageIds = new Set<string>();

  for (const history of allHistory) {
    for (const event of history.messagesAdded || []) {
      addMessageId(addedMessageIds, event.message);
    }
    for (const event of history.messagesDeleted || []) {
      addMessageId(deletedMessageIds, event.message);
    }
    for (const event of history.labelsAdded || []) {
      addMessageId(labelChangedMessageIds, event.message);
    }
    for (const event of history.labelsRemoved || []) {
      addMessageId(labelChangedMessageIds, event.message);
    }
  }

  const messageIds = new Set<string>([
    ...addedMessageIds,
    ...deletedMessageIds,
    ...labelChangedMessageIds,
  ]);

  return {
    latestHistoryId,
    messageIds: [...messageIds],
    addedMessageIds: [...addedMessageIds],
    deletedMessageIds: [...deletedMessageIds],
    labelChangedMessageIds: [...labelChangedMessageIds],
  };
}
