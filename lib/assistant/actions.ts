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
  search: z.string().nullable().optional(),
  sender: z.string().nullable().optional(),
});

export const assistantComposeDraftSchema = z.object({
  to: z.string().min(1),
  cc: z.string().optional(),
  bcc: z.string().optional(),
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

export const assistantEmailListItemSchema = assistantEmailPreviewSchema.extend({
  position: z.number().int().min(1).max(100),
  to: z.array(z.object({ name: z.string(), email: z.string() })).optional(),
});

export const assistantEmailListContextSchema = z.object({
  source: z.enum(["visible-list", "assistant-results"]),
  pathname: z.string(),
  view: assistantMailViewSchema,
  filters: assistantFiltersSchema,
  emails: z.array(assistantEmailListItemSchema).max(25),
  resultSizeEstimate: z.number().int().nonnegative().optional(),
  nextPageAvailable: z.boolean().optional(),
  pageToken: z.string().optional(),
  capturedAt: z.string(),
});

export const assistantOpenEmailSchema = z.object({
  id: z.string(),
  fromName: z.string(),
  fromEmail: z.string(),
  to: z.array(z.object({ name: z.string(), email: z.string() })),
  subject: z.string(),
  snippet: z.string(),
  body: z.string().optional(),
  htmlBody: z.string().optional(),
  date: z.string(),
  unread: z.boolean(),
  starred: z.boolean(),
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
  z.object({
    type: z.literal("deleteEmail"),
    emailId: z.string(),
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

export enum AssistantCommandType {
  Filter = "filter",
  OpenEmail = "openEmail",
  Compose = "compose",
  Reply = "reply",
  ForwardEmails = "forwardEmails",
  Navigate = "navigate",
  ClearFilters = "clearFilters",
  Answer = "answer",
  Delete = "delete",
}

export const assistantCommandTypeSchema = z.nativeEnum(AssistantCommandType);

export const assistantPlanStepSchema = z.object({
  type: assistantCommandTypeSchema,
  view: mailViewSchema.optional(),
  route: mailRouteSchema.optional(),
  search: z.string().optional(),
  sender: z.string().optional(),
  keyword: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  to: z.string().optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  unread: z.boolean().optional(),
  maxResults: z.number().int().min(1).max(50).optional(),
  shouldSend: z.boolean().optional(),
  usePreviousResults: z.boolean().optional(),
  resultIndex: z.number().int().min(1).max(50).optional(),
});

export const assistantPlanSchema = z.object({
  response: z.string(),
  steps: z.array(assistantPlanStepSchema).min(1).max(4),
});

const assistantNullablePlanStepSchema = z.object({
  type: z.enum([
    "filter",
    "openEmail",
    "compose",
    "reply",
    "forwardEmails",
    "navigate",
    "clearFilters",
    "answer",
    "delete",
  ]),
  view: mailViewSchema.nullable(),
  route: mailRouteSchema.nullable(),
  search: z.string().nullable(),
  sender: z.string().nullable(),
  keyword: z.string().nullable(),
  subject: z.string().nullable(),
  body: z.string().nullable(),
  to: z.string().nullable(),
  cc: z.string().nullable(),
  bcc: z.string().nullable(),
  dateFrom: z.string().nullable(),
  dateTo: z.string().nullable(),
  unread: z.boolean().nullable(),
  maxResults: z.number().int().min(1).max(50).nullable(),
  shouldSend: z.boolean().nullable(),
  usePreviousResults: z.boolean().nullable(),
  resultIndex: z.number().int().min(1).max(50).nullable(),
});

export const assistantStructuredPlanSchema = z.object({
  response: z.string(),
  steps: z.array(assistantNullablePlanStepSchema).min(1).max(4),
});

export function normalizeStructuredAssistantPlan(
  plan: z.infer<typeof assistantStructuredPlanSchema>
): z.infer<typeof assistantPlanSchema> {
  const steps = plan.steps.map((step) => {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(step)) {
      if (value !== null) {
        normalized[key] = value;
      }
    }

    return normalized;
  });

  return assistantPlanSchema.parse({
    response: plan.response,
    steps,
  });
}

export const assistantRequestSchema = z.object({
  messages: z.array(assistantChatMessageSchema).min(1).max(20),
  context: z.object({
    pathname: z.string(),
    currentView: assistantMailViewSchema.optional(),
    openEmailId: z.string().nullable().optional(),
    openEmail: assistantOpenEmailSchema.optional(),
    filters: assistantFiltersSchema.optional(),
    currentList: assistantEmailListContextSchema.nullable().optional(),
    lastAssistantResults: assistantEmailListContextSchema.nullable().optional(),
    currentUrl: z.string().optional(),
    latestUserMessage: z.string().optional(),
    currentDate: z.string(),
    timezone: z.string().optional(),
    currentComposeFormState: z
      .object({
        to: z.string(),
        cc: z.string(),
        bcc: z.string(),
        subject: z.string(),
        body: z.string(),
      })
      .nullable()
      .optional(),
  }),
});

export type AssistantFilters = z.infer<typeof assistantFiltersSchema>;
export type AssistantComposeDraft = z.infer<typeof assistantComposeDraftSchema>;
export type AssistantEmailPreview = z.infer<typeof assistantEmailPreviewSchema>;
export type AssistantEmailListContext = z.infer<typeof assistantEmailListContextSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
export type AssistantUiAction = z.infer<typeof assistantUiActionSchema>;
export type AssistantChatMessage = z.infer<typeof assistantChatMessageSchema>;
export type AssistantPlan = z.infer<typeof assistantPlanSchema>;
export type AssistantPlanStep = z.infer<typeof assistantPlanStepSchema>;
