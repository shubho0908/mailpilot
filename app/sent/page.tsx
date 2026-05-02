import { SentView } from "@/components/mail/sentView";
import { MailLayout } from "@/components/mail/mailLayout";
import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sent - MailPilot",
  description: "View your sent emails with AI assistance.",
};

export default async function SentPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return (
    <MailLayout>
      <SentView />
    </MailLayout>
  );
}
