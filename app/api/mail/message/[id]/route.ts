import { NextRequest, NextResponse } from "next/server";
import { requireGmailAuth, handleAuthError } from "@/lib/auth-session";
import { getEmail } from "@/services/gmail/gmail.service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:mail:message");

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid email ID" }, { status: 400 });
    }

    const { auth, userId } = await requireGmailAuth(request.headers);

    const email = await getEmail(auth, id);

    logger.info("Successfully fetched email", {
      userId,
      emailId: id,
    });

    return NextResponse.json(
      { email },
      {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      }
    );
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status === 401) {
      return authError;
    }
    logger.error("Error fetching email", error);
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 });
  }
}
