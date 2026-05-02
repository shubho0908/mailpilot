import { EmailDetailWrapper } from "@/components/mail/emailDetailWrapper";
import { MailLayout } from "@/components/mail/mailLayout";
import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

interface EmailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Email - MailPilot",
  description: "View email details with AI assistance.",
};

export default async function EmailPage({ params }: EmailPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  const { id: emailId } = await params;

  return (
    <MailLayout>
      <EmailDetailWrapper emailId={emailId} />
    </MailLayout>
  );
}
