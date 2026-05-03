import { EmailDetailWrapper } from "@/components/mail/emailDetailWrapper";
import { MailLayout } from "@/components/mail/mailLayout";
import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface EmailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EmailPageProps): Promise<Metadata> {
  const { id: emailId } = await params;

  return {
    title: `Sent Email ${emailId}`,
    description:
      "View sent email details with AI assistance. Review your outgoing communications, check delivery status, and manage your sent messages efficiently.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Sent Email | MailPilot`,
      description:
        "View sent email details with AI assistance. Review your outgoing communications, check delivery status, and manage your sent messages efficiently.",
      url: `https://mailpilot.shubhojeet.com/sent/${emailId}`,
      type: "website",
    },
  };
}

export default async function SentEmailPage({ params }: EmailPageProps) {
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
