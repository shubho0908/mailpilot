import { z } from "zod";
import { mailLabelSchema, type MailLabel } from "@/lib/mail/types";

const emailSchema = z.email();

const parseEmails = (value: unknown): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  }
  return [];
};

const emailOrArraySchema = z.preprocess(
  parseEmails,
  z.array(emailSchema).min(1, "At least one email is required")
);

export type Label = MailLabel;

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

export const sendEmailSchema = z.object({
  to: emailOrArraySchema,
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  cc: emailOrArraySchema.optional(),
  bcc: emailOrArraySchema.optional(),
  htmlBody: z.string().optional(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  references: z.array(z.string()).optional(),
});

export const listEmailsQuerySchema = z.object({
  label: mailLabelSchema.optional(),
  maxResults: z.coerce.number().optional(),
  pageToken: z.string().optional(),
  query: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  subject: z.string().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  unread: booleanQuerySchema.optional(),
});
