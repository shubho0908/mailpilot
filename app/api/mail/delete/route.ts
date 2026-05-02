import { NextRequest, NextResponse } from "next/server";
import { requireGmailAuth, handleAuthError } from "@/lib/auth-session";
import { deleteEmail } from "@/services/gmail/gmail.service";
import { createLogger } from "@/lib/logger";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/request-auth";

const logger = createLogger("api:mail:delete");

const deleteEmailSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request.headers);

    const body = await request.json();
    const validationResult = deleteEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: z.flattenError(validationResult.error).fieldErrors },
        { status: 400 }
      );
    }

    const { id } = validationResult.data;
    const { auth, userId } = await requireGmailAuth(request.headers);

    await deleteEmail(auth, id);

    logger.info("Successfully deleted email", { userId, emailId: id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return authError;
    }
    logger.error("Error deleting email", error);
    return NextResponse.json({ error: "Failed to delete email" }, { status: 500 });
  }
}
