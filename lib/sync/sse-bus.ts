import { createLogger } from "@/lib/logger";
import type { MailChangedEvent } from "@/lib/sync/events";

const logger = createLogger("sync:sse-bus");
const encoder = new TextEncoder();
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function addMailEventClient(
  userId: string,
  controller: ReadableStreamDefaultController
): () => void {
  const userClients = clients.get(userId) ?? new Set<ReadableStreamDefaultController>();
  userClients.add(controller);
  clients.set(userId, userClients);

  return () => {
    userClients.delete(controller);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  };
}

export function sendSseComment(controller: ReadableStreamDefaultController, comment: string) {
  controller.enqueue(encoder.encode(`: ${comment}\n\n`));
}

export function broadcastMailEvent(event: MailChangedEvent) {
  const userClients = clients.get(event.userId);
  if (!userClients?.size) {
    return;
  }

  const message = encoder.encode(`data: ${JSON.stringify(event)}\n\n`);

  for (const controller of userClients) {
    try {
      controller.enqueue(message);
    } catch (error) {
      logger.error("Failed to broadcast mail event", { error });
      userClients.delete(controller);
    }
  }

  if (userClients.size === 0) {
    clients.delete(event.userId);
  }
}
