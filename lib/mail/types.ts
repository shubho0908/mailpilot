import { z } from "zod";

export const mailLabelSchema = z.enum(["INBOX", "SENT"]);
export const mailViewSchema = z.enum(["inbox", "sent"]);
export const mailRouteSchema = z.enum([...mailViewSchema.options, "compose"]);
export const composeModeSchema = z.enum(["compose", "reply", "forward"]);
export const assistantRoleSchema = z.enum(["user", "assistant"]);
export const mailFiltersSchema = z.object({
  search: z.string(),
  dateFrom: z.string().nullable(),
  dateTo: z.string().nullable(),
  sender: z.string().nullable(),
  unread: z.boolean().nullable(),
  maxResults: z.number().int().min(1).max(50).nullable(),
});

export type MailLabel = z.infer<typeof mailLabelSchema>;
export type MailView = z.infer<typeof mailViewSchema>;
export type MailRoute = z.infer<typeof mailRouteSchema>;
export type ComposeMode = z.infer<typeof composeModeSchema>;
export type AssistantRole = z.infer<typeof assistantRoleSchema>;
export type MailFilters = z.infer<typeof mailFiltersSchema>;

export const emptyMailFilters: MailFilters = {
  search: "",
  dateFrom: null,
  dateTo: null,
  sender: null,
  unread: null,
  maxResults: null,
};

export const mailViewByLabel: Record<MailLabel, MailView> = {
  INBOX: "inbox",
  SENT: "sent",
};

export const mailLabelByView: Record<MailView, MailLabel> = {
  inbox: "INBOX",
  sent: "SENT",
};

export function parseMailView(value: string) {
  return mailViewSchema.parse(value);
}

export function isInboxView(view: MailView) {
  return view === mailViewSchema.enum.inbox;
}

export function isSentView(view: MailView) {
  return view === mailViewSchema.enum.sent;
}

export function pathForMailRoute(route: MailRoute) {
  return `/${route}`;
}
