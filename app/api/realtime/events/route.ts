import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth-session";
import { createLogger } from "@/lib/logger";
import { addMailEventClient, sendSseComment } from "@/lib/sync/sse-bus";

const logger = createLogger("api:realtime:events");

const KEEP_ALIVE_INTERVAL = 30000;

export async function GET(request: NextRequest) {
  const session = await getCurrentSession(request.headers);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      const removeClient = addMailEventClient(userId, controller);

      sendSseComment(controller, "connected");

      const keepAlive = setInterval(() => {
        try {
          sendSseComment(controller, "keep-alive");
        } catch (error) {
          logger.warn("Failed to send keep-alive", { error });
          clearInterval(keepAlive);
          removeClient();
        }
      }, KEEP_ALIVE_INTERVAL);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        removeClient();
        try {
          controller.close();
        } catch (error) {
          logger.warn("Failed to close controller", { error });
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
