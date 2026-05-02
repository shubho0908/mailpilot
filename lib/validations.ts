import { z } from "zod";
import { mailLabelSchema, type MailLabel } from "@/lib/mail/types";

const emailSchema = z.email();
const emailOrArraySchema = z.union([emailSchema, z.array(emailSchema)]);

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

export type ListEmailsQuery = z.infer<typeof listEmailsQuerySchema>;

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
