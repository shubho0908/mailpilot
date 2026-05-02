import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentSession, handleAuthError } from "@/lib/auth-session";
import { assertSameOrigin } from "@/lib/request-auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request.headers);

    const session = await getCurrentSession(request.headers);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await auth.api.signOut({
      headers: request.headers,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return authError;
    }

    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
