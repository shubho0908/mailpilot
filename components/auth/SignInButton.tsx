"use client";

import { useTransition } from "react";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export function SignInButton() {
  const [isPending, startTransition] = useTransition();

  const signIn = async () => {
    startTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    });
  };

  return (
    <Button onClick={signIn} disabled={isPending} size="lg">
      {isPending ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}
