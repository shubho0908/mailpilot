import { NextResponse } from "next/server";
import { getCurrentSession, handleAuthError } from "@/lib/auth-session";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt, maskApiKey } from "@/lib/crypto";
import { assertSameOrigin } from "@/lib/request-auth";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        openaiApiKey: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const encryptedKey = currentUser.openaiApiKey;
    let maskedKey = null;

    if (encryptedKey) {
      try {
        const decryptedKey = decrypt(encryptedKey);
        maskedKey = maskApiKey(decryptedKey);
      } catch (error) {
        console.error("Error decrypting API key:", error);
        maskedKey = "***";
      }
    }

    return NextResponse.json({
      apiKey: maskedKey,
      hasApiKey: !!encryptedKey,
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return authError;
    }

    console.error("Error fetching API key:", error);
    return NextResponse.json({ error: "Failed to fetch API key" }, { status: 500 });
  }
}

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

    if (!apiKey.startsWith("sk-") || apiKey.length > 512) {
      return NextResponse.json({ error: "Invalid OpenAI API key format" }, { status: 400 });
    }

    const encryptedKey = encrypt(apiKey);

    await db.update(user).set({ openaiApiKey: encryptedKey }).where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return authError;
    }

    console.error("Error setting API key:", error);
    return NextResponse.json({ error: "Failed to set API key" }, { status: 500 });
  }
}
