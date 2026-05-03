import { NextResponse } from "next/server";
import { getCurrentSession, handleAuthError } from "@/lib/auth-session";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { assertSameOrigin } from "@/lib/request-auth";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api:user:api-key");

export async function POST(request: Request) {
  try {
    assertSameOrigin(request.headers);

    const session = await getCurrentSession(request.headers);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    }

    if (!apiKey.startsWith("sk-") || apiKey.length < 20 || apiKey.length > 512) {
      return NextResponse.json({ error: "Invalid OpenAI API key format" }, { status: 400 });
    }

    const encryptedKey = encrypt(apiKey);

    try {
      const decryptedKey = decrypt(encryptedKey);
      if (decryptedKey !== apiKey) {
        return NextResponse.json({ error: "Failed to securely store API key" }, { status: 500 });
      }
    } catch (error) {
      logger.error("OpenAI API key encryption round-trip failed", error);
      return NextResponse.json({ error: "Failed to securely store API key" }, { status: 500 });
    }

    await db.update(user).set({ openaiApiKey: encryptedKey }).where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return authError;
    }

    logger.error("Failed to set OpenAI API key", error);
    return NextResponse.json({ error: "Failed to set API key" }, { status: 500 });
  }
}
