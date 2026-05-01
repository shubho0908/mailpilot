import { SignInButton } from "@/components/auth/SignInButton";
import { MailLayout } from "@/components/mail/mailLayout";
import { getCurrentSession } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <section className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">MailPilot</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to read and compose mail from your Google account.
            </p>
          </div>
          <SignInButton />
        </section>
      </main>
    );
  }

  return <MailLayout />;
}
