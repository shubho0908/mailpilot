import { NextRequest, NextResponse } from "next/server";
import { handleAuthError, requireGmailAuth } from "@/lib/auth-session";
import { isAppError, isAuthError, mapOpenAIError, ErrorCode } from "@/lib/errors";
import { assistantRequestSchema } from "@/lib/assistant/actions";
import { buildSystemPrompt, generateCommandWithRetry } from "@/lib/assistant/command-generator";
import { resolveCommand } from "@/lib/assistant/command-resolver";
import { assistantRoleSchema } from "@/lib/mail/types";
import type { AssistantChatMessage } from "@/lib/assistant/actions";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { getEmail } from "@/services/gmail/gmail.service";
import { toAssistantOpenEmail } from "@/lib/assistant/email-transformers";
import { getUserOpenAIKey } from "@/lib/api-key-utils";
import { assertSameOrigin } from "@/lib/request-auth";
import { createLogger } from "@/lib/logger";

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
    assertSameOrigin(request.headers);

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
    const userOpenAIKey = await getUserOpenAIKey(userId);

    if (!userOpenAIKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured for this user" },
        { status: 400 }
      );
    }

    let enrichedContext = {
      ...context,
      latestUserMessage:
        context.latestUserMessage ??
        [...messages].reverse().find((message) => message.role === assistantRoleSchema.enum.user)
          ?.content,
    };
    if (context.openEmailId && !context.openEmail) {
      try {
        const email = await getEmail(auth, context.openEmailId);
        enrichedContext = {
          ...enrichedContext,
          openEmail: toAssistantOpenEmail(email),
        };
      } catch (error) {
        logger.warn("Failed to enrich assistant context with open email", {
          error,
        });
      }
    }

    const systemPrompt = buildSystemPrompt(enrichedContext);
    const mappedMessages = messages.map(toModelMessage);

    const commandResult = await generateCommandWithRetry(
      mappedMessages,
      systemPrompt,
      userId,
      userOpenAIKey
    );

    const response = await resolveCommand(commandResult, enrichedContext, auth);

    return NextResponse.json({
      message: response.message,
      actions: response.actions,
      previews: response.previews,
    });
  } catch (error) {
    if (isAuthError(error) || (isAppError(error) && [401, 403].includes(error.statusCode))) {
      const authError = handleAuthError(error);
      return authError;
    }

    const mappedError = mapOpenAIError(error);
    const appError = isAppError(error) ? error : mappedError;

    logger.error("Assistant request failed", error);

    const errorName = getErrorName(error);

    let userMessage = "I couldn't understand that request. Could you rephrase it?";

    if (appError) {
      switch (appError.code) {
        case ErrorCode.OPENAI_API_KEY_INVALID:
          userMessage =
            "There's an issue with your OpenAI API key. Please check your API key configuration in settings.";
          break;
        case ErrorCode.OPENAI_RATE_LIMIT_EXCEEDED:
          userMessage = "I'm receiving too many requests right now. Please try again in a moment.";
          break;
        case ErrorCode.OPENAI_QUOTA_EXCEEDED:
          userMessage = "Your OpenAI API quota has been exceeded. Please check your billing.";
          break;
        case ErrorCode.OPENAI_MODEL_NOT_FOUND:
          userMessage = "The AI model is currently unavailable. Please try again later.";
          break;
        default:
          userMessage = "I couldn't understand that request. Could you rephrase it?";
      }
    }

    return NextResponse.json(
      {
        message: userMessage,
        error: userMessage,
        errorType: errorName,
        errorCode: appError?.code,
        actions: [],
        previews: [],
      },
      { status: appError?.statusCode ?? 500 }
    );
  }
}
