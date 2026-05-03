import { Inbox } from "@/components/mail/inbox";
import { MailLayout } from "@/components/mail/mailLayout";
import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inbox",
  description:
    "View and manage your Gmail inbox with AI assistance. Filter emails, search messages, and use natural language commands to manage your inbox efficiently.",
  keywords: ["email inbox", "Gmail inbox", "AI email management", "smart inbox", "email filtering"],
  openGraph: {
    title: "Inbox | MailPilot",
    description:
      "View and manage your Gmail inbox with AI assistance. Filter emails, search messages, and use natural language commands to manage your inbox efficiently.",
    url: "https://mailpilot.shubhojeet.com/inbox",
    type: "website",
  },
  twitter: {
    title: "Inbox | MailPilot",
    description:
      "View and manage your Gmail inbox with AI assistance. Filter emails, search messages, and use natural language commands to manage your inbox efficiently.",
    card: "summary_large_image",
  },
};

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
