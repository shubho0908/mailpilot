import { SignInButton } from "@/components/auth/SignInButton";
import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <section className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">MailPilot</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to read and compose mail from your Google account.
            </p>
          </div>
          <SignInButton />
        </section>
      </main>
    );
  }

  redirect("/inbox");
}
