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
    title: `Email ${emailId}`,
    description:
      "View email details with AI assistance. Read, reply, forward, or manage your emails with natural language commands.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Email | MailPilot`,
      description:
        "View email details with AI assistance. Read, reply, forward, or manage your emails with natural language commands.",
      url: `https://mailpilot.shubhojeet.com/inbox/${emailId}`,
      type: "website",
    },
  };
}

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
