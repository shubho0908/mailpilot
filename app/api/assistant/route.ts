import { NextRequest, NextResponse } from "next/server";
import { handleAuthError, requireGmailAuth } from "@/lib/auth-session";
import { isAppError, isAuthError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { assistantRequestSchema } from "@/lib/assistant/actions";
import { buildSystemPrompt, generateCommandWithRetry } from "@/lib/assistant/command-generator";
import { resolveCommand } from "@/lib/assistant/command-resolver";
import { assistantRoleSchema } from "@/lib/mail/types";
import type { AssistantChatMessage } from "@/lib/assistant/actions";
import type { ModelMessage } from "ai";
import { z } from "zod";

const logger = createLogger("api:assistant");

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
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is required for the assistant planner." },
        { status: 503 }
      );
    }

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

    const systemPrompt = buildSystemPrompt(context);
    const mappedMessages = messages.map(toModelMessage);

    const commandResult = await generateCommandWithRetry(mappedMessages, systemPrompt, userId);
    const response = await resolveCommand(commandResult, context, auth);

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
