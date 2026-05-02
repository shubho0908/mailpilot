import { NextRequest, NextResponse } from "next/server";
import { handleAuthError, requireGmailAuth } from "@/lib/auth-session";
import { isAppError, isAuthError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { requireEnv } from "@/lib/env";
import { assistantRequestSchema } from "@/lib/assistant/actions";
import { buildSystemPrompt, generateCommandWithRetry } from "@/lib/assistant/command-generator";
import { resolveCommand } from "@/lib/assistant/command-resolver";
import { assistantRoleSchema } from "@/lib/mail/types";
import type { AssistantChatMessage } from "@/lib/assistant/actions";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { getEmail } from "@/services/gmail/gmail.service";
import { toAssistantOpenEmail } from "@/lib/assistant/email-transformers";

const logger = createLogger("api:assistant");

requireEnv("OPENAI_API_KEY");

function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

function toModelMessage(message: AssistantChatMessage): ModelMessage {
  if (message.role === assistantRoleSchema.enum.user) {
    return { role: assistantRoleSchema.enum.user, content: message.content };
  }

  return { role: assistantRoleSchema.enum.assistant, content: message.content };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = assistantRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: z.flattenError(parsedBody.error).fieldErrors },
        { status: 400 }
      );
    }

    const { auth, userId } = await requireGmailAuth(request.headers);
    const { messages, context } = parsedBody.data;

    let enrichedContext = context;
    if (context.openEmailId && !context.openEmail) {
      try {
        const email = await getEmail(auth, context.openEmailId);
        enrichedContext = {
          ...context,
          openEmail: toAssistantOpenEmail(email),
        };
      } catch (fetchError) {
        logger.warn("Failed to fetch open email for assistant context", {
          emailId: context.openEmailId,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        });
      }
    }

    const systemPrompt = buildSystemPrompt(enrichedContext);
    const mappedMessages = messages.map(toModelMessage);

    const commandResult = await generateCommandWithRetry(mappedMessages, systemPrompt, userId);
    const response = await resolveCommand(commandResult, enrichedContext, auth);

    return NextResponse.json(response);
  } catch (error) {
    if (isAuthError(error) || (isAppError(error) && error.statusCode === 401)) {
      const authError = handleAuthError(error);
      return authError;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Assistant planning failed after all retries", {
      error: errorMessage,
      errorName: getErrorName(error),
    });

    return NextResponse.json(
      {
        message: "I couldn't understand that request. Could you rephrase it?",
        actions: [],
        previews: [],
      },
      { status: 200 }
    );
  }
}
