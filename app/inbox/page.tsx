import { Inbox } from "@/components/mail/inbox";
import { MailLayout } from "@/components/mail/mailLayout";
import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return (
    <MailLayout>
      <Inbox />
    </MailLayout>
  );
}
