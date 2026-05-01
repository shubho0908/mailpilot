import type { gmail_v1 } from "googleapis";
import type { Credentials } from "google-auth-library";

export interface GmailClientAuth {
  accessToken: string;
  refreshToken?: string;
  onTokens?: (tokens: Credentials) => void | Promise<void>;
}

export type GmailAuth = string | GmailClientAuth;

export interface GmailFilter {
  label?: "INBOX" | "SENT";
  from?: string;
  to?: string;
  subject?: string;
  query?: string;
  after?: string;
  before?: string;
  unread?: boolean;
  starred?: boolean;
  hasAttachment?: boolean;
}

export interface ListEmailsOptions {
  filters?: GmailFilter;
  maxResults?: number;
  pageToken?: string;
  includeSpamTrash?: boolean;
}

export interface ListEmailsResult {
  emails: Email[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface Email {
  id: string;
  threadId: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  subject: string;
  snippet: string;
  body: string;
  htmlBody?: string;
  date: Date;
  labels: string[];
  unread: boolean;
  starred: boolean;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailAddress {
  name: string;
  email: string;
}

export interface EmailBody {
  text: string;
  html: string;
}

export interface SendEmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: {
    filename: string;
    content: string;
    mimeType?: string;
    contentTransferEncoding?: "base64" | "raw";
  }[];
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

export type GmailMessage = gmail_v1.Schema$Message;
