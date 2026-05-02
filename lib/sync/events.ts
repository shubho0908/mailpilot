import { z } from "zod";

export const mailChangedEventSchema = z.object({
  type: z.literal("mail.changed"),
  userId: z.string(),
  emailAddress: z.string().email(),
  historyId: z.string(),
  messageIds: z.array(z.string()),
  addedMessageIds: z.array(z.string()),
  deletedMessageIds: z.array(z.string()),
  labelChangedMessageIds: z.array(z.string()),
  fullRefresh: z.boolean().optional(),
  occurredAt: z.string(),
});

export type MailChangedEvent = z.infer<typeof mailChangedEventSchema>;
