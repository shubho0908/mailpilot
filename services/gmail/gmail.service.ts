import type { gmail_v1 } from "googleapis";
import { getGmailClient } from "./gmail.client";
import {
  buildGmailQuery,
  parseEmailHeaders,
  extractEmailAddress,
  extractEmailAddresses,
  extractEmailBody,
  extractAttachments,
  createMimeMessage,
} from "./gmail.mime";
import type {
  GmailAuth,
  ListEmailsOptions,
  ListEmailsResult,
  SendEmailPayload,
  GmailMessage,
  Email,
  EmailThread,
} from "./gmail.types";
import { handleApiError } from "@/lib/error-mapping";
import { createLogger } from "@/lib/logger";

const logger = createLogger("gmail.service");
const DEFAULT_MAX_RESULTS = 20;
const MAX_RESULTS_LIMIT = 100;

function encodeBase64Url(data: string): string {
  return Buffer.from(data, "utf8").toString("base64url");
}

function normalizeMaxResults(maxResults?: number): number {
  if (!maxResults || Number.isNaN(maxResults)) return DEFAULT_MAX_RESULTS;
  return Math.max(1, Math.min(Math.floor(maxResults), MAX_RESULTS_LIMIT));
}

function getMessageDate(
  headersDate: string | undefined,
  internalDate: string | null | undefined
): Date {
  const parsedHeaderDate = headersDate ? new Date(headersDate) : undefined;

  if (parsedHeaderDate && !Number.isNaN(parsedHeaderDate.getTime())) {
    return parsedHeaderDate;
  }

  if (internalDate) {
    const parsedInternalDate = new Date(Number(internalDate));
    if (!Number.isNaN(parsedInternalDate.getTime())) {
      return parsedInternalDate;
    }
  }

  return new Date(0);
}

function isGmailMessage(message: unknown): message is GmailMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "id" in message &&
    "threadId" in message &&
    "payload" in message
  );
}

function isGmailThread(thread: unknown): thread is gmail_v1.Schema$Thread {
  return typeof thread === "object" && thread !== null && "id" in thread && "messages" in thread;
}

function assertMessageIsParseable(message: GmailMessage): asserts message is GmailMessage & {
  id: string;
  threadId: string;
  payload: gmail_v1.Schema$MessagePart;
} {
  if (!message.id || !message.threadId || !message.payload) {
    throw new Error("Gmail message response is missing id, threadId, or payload");
  }
}

function parseReferencesHeader(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\s+/)
    .map((reference) => reference.trim())
    .filter(Boolean);
}

function parseMessage(message: GmailMessage): Email {
  assertMessageIsParseable(message);

  const headers = parseEmailHeaders(message.payload?.headers);
  const fromHeader = headers["from"] || "";
  const toHeader = headers["to"] || "";
  const subject = headers["subject"] || "";

  const from = extractEmailAddress(fromHeader);
  const to = extractEmailAddresses(toHeader);

  const { text: body, html: htmlBody } = extractEmailBody(message.payload);
  const attachments = extractAttachments(message.payload);

  const labelIds = message.labelIds || [];
  const unread = labelIds.includes("UNREAD");
  const starred = labelIds.includes("STARRED");

  return {
    id: message.id,
    threadId: message.threadId,
    messageId: headers["message-id"] || undefined,
    references: parseReferencesHeader(headers["references"]),
    from,
    to,
    subject,
    snippet: message.snippet || "",
    body,
    htmlBody,
    date: getMessageDate(headers["date"], message.internalDate),
    labels: labelIds,
    unread,
    starred,
    attachments,
  };
}

export async function listEmailsPage(
  auth: GmailAuth,
  options: ListEmailsOptions = {}
): Promise<ListEmailsResult> {
  try {
    const gmail = await getGmailClient(auth);
    const filters = options.filters || {};
    const query = buildGmailQuery(filters);

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query || undefined,
      labelIds: filters.label ? [filters.label] : undefined,
      maxResults: normalizeMaxResults(options.maxResults),
      pageToken: options.pageToken,
      includeSpamTrash: options.includeSpamTrash,
    });

    const messages = response.data.messages || [];
    const emails = await Promise.all(
      messages
        .filter((message): message is gmail_v1.Schema$Message & { id: string } =>
          Boolean(message.id)
        )
        .map((message) => getEmail(auth, message.id))
    );

    return {
      emails,
      nextPageToken: response.data.nextPageToken || undefined,
      resultSizeEstimate: response.data.resultSizeEstimate || undefined,
    };
  } catch (error) {
    logger.error("Failed to list emails", error, {
      filters: options.filters,
      maxResults: options.maxResults,
      pageToken: options.pageToken,
    });
    handleApiError(error, "listEmails");
  }
}

export async function getEmail(auth: GmailAuth, id: string): Promise<Email> {
  try {
    const gmail = await getGmailClient(auth);
    const response = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const message = response.data;
    if (!isGmailMessage(message)) {
      throw new Error("Invalid Gmail message response");
    }
    return parseMessage(message);
  } catch (error) {
    logger.error("Failed to get email", error, { id });
    handleApiError(error, "getEmail");
  }
}

export async function getEmailThread(auth: GmailAuth, threadId: string): Promise<EmailThread> {
  try {
    const gmail = await getGmailClient(auth);
    const response = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
    });

    const thread = response.data;
    if (!isGmailThread(thread) || !thread.id) {
      throw new Error("Invalid Gmail thread response");
    }

    const messages = (thread.messages || [])
      .filter(isGmailMessage)
      .map(parseMessage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      id: thread.id,
      messages,
    };
  } catch (error) {
    logger.error("Failed to get email thread", error, { threadId });
    handleApiError(error, "getEmailThread");
  }
}

export async function sendEmail(auth: GmailAuth, payload: SendEmailPayload): Promise<string> {
  try {
    const gmail = await getGmailClient(auth);
    const mimeMessage = createMimeMessage(payload);

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeBase64Url(mimeMessage),
        threadId: payload.threadId,
      },
    });

    return response.data.id || "";
  } catch (error) {
    logger.error("Failed to send email", error, { to: payload.to, subject: payload.subject });
    handleApiError(error, "sendEmail");
  }
}
