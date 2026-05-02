import { NextRequest, NextResponse } from "next/server";
import { requireGmailAuth, handleAuthError } from "@/lib/auth-session";
import { sendEmail } from "@/services/gmail/gmail.service";
import type { SendEmailPayload } from "@/services/gmail/gmail.types";
import { createLogger } from "@/lib/logger";
import { sendEmailSchema } from "@/lib/validations";
import { z } from "zod";

const logger = createLogger("api:mail:send");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = sendEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: z.flattenError(validationResult.error).fieldErrors },
        { status: 400 }
      );
    }

    const {
      to,
      subject,
      body: emailBody,
      cc,
      bcc,
      htmlBody,
      threadId,
      inReplyTo,
      references,
    } = validationResult.data;

    const { auth, userId } = await requireGmailAuth(request.headers);

    const toList = Array.isArray(to) ? to : [to];
    const payload: SendEmailPayload = {
      to: toList,
      subject,
      body: emailBody,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      htmlBody,
      threadId,
      inReplyTo,
      references,
    };

    const messageId = await sendEmail(auth, payload);

    logger.info("Successfully sent email", {
      userId,
      messageId,
      to: toList.length,
    });

    return NextResponse.json({ messageId }, { status: 201 });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status === 401) {
      return authError;
    }
    logger.error("Error sending email", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
