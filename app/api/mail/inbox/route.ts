import { NextRequest, NextResponse } from "next/server";
import { requireGmailAuth, handleAuthError } from "@/lib/auth-session";
import { listEmailsPage } from "@/services/gmail/gmail.service";
import { createLogger } from "@/lib/logger";
import { listEmailsQuerySchema } from "@/lib/validations";
import { z } from "zod";

const logger = createLogger("api:mail:inbox");

export async function GET(request: NextRequest) {
  try {
    const { auth, userId } = await requireGmailAuth(request.headers);

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validationResult = listEmailsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: z.flattenError(validationResult.error).fieldErrors },
        { status: 400 }
      );
    }

    const { label, maxResults, pageToken, query, from, to, subject, after, before, unread } =
      validationResult.data;

    const result = await listEmailsPage(auth, {
      filters: {
        label,
        query,
        from,
        to,
        subject,
        after,
        before,
        unread,
      },
      maxResults,
      pageToken,
    });

    logger.info("Successfully fetched emails", {
      userId,
      label,
      count: result.emails.length,
      hasNextPage: !!result.nextPageToken,
    });

    return NextResponse.json(
      {
        emails: result.emails,
        nextPageToken: result.nextPageToken,
        resultSizeEstimate: result.resultSizeEstimate,
      },
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
    logger.error("Error fetching emails", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
