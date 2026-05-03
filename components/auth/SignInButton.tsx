"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useTransition } from "react";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

type SignInButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "disabled" | "onClick"> & {
  children?: ReactNode;
  pendingLabel?: string;
};

export function SignInButton({
  children = "Sign in with Google",
  pendingLabel = "Signing in...",
  ...props
}: SignInButtonProps) {
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
    <Button onClick={signIn} disabled={isPending} size="lg" {...props}>
      {isPending ? pendingLabel : children}
    </Button>
  );
}
