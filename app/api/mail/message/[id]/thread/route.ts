import { NextRequest, NextResponse } from "next/server";
import { requireGmailAuth, handleAuthError } from "@/lib/auth-session";
import { getEmail, getEmailThread } from "@/services/gmail/gmail.service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:mail:message-thread");

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid email ID" }, { status: 400 });
    }

    const { auth, userId } = await requireGmailAuth(request.headers);
    const email = await getEmail(auth, id);
    const thread = await getEmailThread(auth, email.threadId);
    const currentEmail = thread.messages.find((message) => message.id === id) || email;

    logger.info("Successfully fetched email thread", {
      userId,
      emailId: id,
      threadId: thread.id,
      messageCount: thread.messages.length,
    });

    return NextResponse.json(
      { email: currentEmail, thread },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status === 401) {
      return authError;
    }
    logger.error("Error fetching email thread", error);
    return NextResponse.json({ error: "Failed to fetch email thread" }, { status: 500 });
  }
}
