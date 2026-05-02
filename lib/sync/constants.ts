export enum SyncStatus {
  Idle = "idle",
  Connecting = "connecting",
  Live = "live",
  Syncing = "syncing",
  Error = "error",
  Disabled = "disabled",
  Partial = "partial",
}

export enum GmailHistoryType {
  MessageAdded = "messageAdded",
  MessageDeleted = "messageDeleted",
  LabelAdded = "labelAdded",
  LabelRemoved = "labelRemoved",
}

export enum RuntimeEnvironment {
  Development = "development",
  Production = "production",
}

export const GMAIL_SYNC_ENV = {
  pubSubTopic: "GMAIL_PUBSUB_TOPIC",
  pubSubVerificationToken: "GMAIL_PUBSUB_VERIFICATION_TOKEN",
  pubSubAudience: "GMAIL_PUBSUB_AUDIENCE",
  pubSubServiceAccountEmail: "GMAIL_PUBSUB_SERVICE_ACCOUNT_EMAIL",
  cronSecret: "CRON_SECRET",
} as const;

export const WATCH_RENEWAL_WINDOW_MS = 24 * 60 * 60 * 1000;
export const CRON_RENEWAL_WINDOW_MS = 48 * 60 * 60 * 1000;

export const HTTP_AUTH_SCHEME = "Bearer";
