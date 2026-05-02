import { z } from "zod";
import {
  assistantRoleSchema,
  composeModeSchema,
  mailFiltersSchema,
  mailRouteSchema,
  mailViewSchema,
} from "@/lib/mail/types";

export const assistantMailViewSchema = mailViewSchema;

export const assistantFiltersSchema = mailFiltersSchema.extend({
  search: z.string().nullable(),
  sender: z.email().nullable(),
});

export const assistantComposeDraftSchema = z.object({
  to: z.email(),
  cc: z.email().optional(),
  bcc: z.email().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  mode: composeModeSchema.default("compose"),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  references: z.array(z.string()).optional(),
});

export const assistantEmailPreviewSchema = z.object({
  id: z.string(),
  fromName: z.string(),
  fromEmail: z.string(),
  subject: z.string(),
  snippet: z.string(),
  date: z.string(),
  unread: z.boolean(),
});

export const assistantUiActionSchema = z.union([
  z.object({
    type: z.literal("navigate"),
    path: z.string(),
  }),
  z.object({
    type: z.literal("setFilters"),
    view: assistantMailViewSchema,
    filters: assistantFiltersSchema,
  }),
  z.object({
    type: z.literal("clearFilters"),
    view: assistantMailViewSchema.optional(),
  }),
  z.object({
    type: z.literal("openEmail"),
    view: assistantMailViewSchema,
    emailId: z.string(),
  }),
  z.object({
    type: z.literal("composeDraft"),
    draft: assistantComposeDraftSchema,
    requiresApproval: z.boolean(),
    approvalPrompt: z.string().optional(),
  }),
]);

export const assistantResponseSchema = z.object({
  message: z.string(),
  actions: z.array(assistantUiActionSchema).optional(),
  previews: z.array(assistantEmailPreviewSchema).optional(),
});

export const assistantChatMessageSchema = z.object({
  role: assistantRoleSchema,
  content: z.string(),
});

export const assistantCommandSchema = z.object({
  response: z.string(),
  command: z.union([
    z.object({
      type: z.literal("filter"),
      view: mailViewSchema.nullable(),
      search: z.string().nullable(),
      sender: z.string().nullable(),
      dateFrom: z.string().nullable(),
      dateTo: z.string().nullable(),
      unread: z.boolean().nullable(),
      maxResults: z.number().int().min(1).max(50).nullable(),
    }),
    z.object({
      type: z.literal("openEmail"),
      view: mailViewSchema.nullable(),
      sender: z.string().nullable(),
      keyword: z.string().nullable(),
      subject: z.string().nullable(),
      unread: z.boolean().nullable(),
    }),
    z.object({
      type: z.literal("compose"),
      draft: z.object({
        to: z.email(),
        cc: z.email().nullable(),
        bcc: z.email().nullable(),
        subject: z.string().min(1),
        body: z.string().min(1),
      }),
      shouldSend: z.boolean().nullable(),
    }),
    z.object({
      type: z.literal("reply"),
      body: z.string().nullable(),
      shouldSend: z.boolean().nullable(),
    }),
    z.object({
      type: z.literal("navigate"),
      view: mailRouteSchema,
    }),
    z.object({
      type: z.literal("clearFilters"),
      view: mailViewSchema.nullable(),
    }),
    z.object({
      type: z.literal("answer"),
    }),
  ]),
});

export const assistantRequestSchema = z.object({
  messages: z.array(assistantChatMessageSchema).min(1).max(20),
  context: z.object({
    pathname: z.string(),
    currentView: assistantMailViewSchema.optional(),
    openEmailId: z.string().nullable().optional(),
    filters: assistantFiltersSchema.optional(),
    currentDate: z.string(),
    timezone: z.string().optional(),
  }),
});

export type AssistantFilters = z.infer<typeof assistantFiltersSchema>;
export type AssistantComposeDraft = z.infer<typeof assistantComposeDraftSchema>;
export type AssistantEmailPreview = z.infer<typeof assistantEmailPreviewSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
export type AssistantUiAction = z.infer<typeof assistantUiActionSchema>;
export type AssistantChatMessage = z.infer<typeof assistantChatMessageSchema>;
