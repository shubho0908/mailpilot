import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landingPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MailPilot - AI-Powered Email Assistant",
  description:
    "MailPilot is an AI-powered email assistant that lets you control Gmail with natural language. Filter mail, open threads, draft replies, and queue actions for approval. Transform your email workflow with intelligent automation.",
  keywords: [
    "AI email assistant",
    "Gmail AI",
    "natural language email",
    "email automation",
    "smart inbox",
    "email productivity",
    "AI mail",
    "email management",
  ],
  openGraph: {
    title: "MailPilot - AI-Powered Email Assistant",
    description:
      "Control Gmail with natural language. Filter mail, open threads, draft replies, and queue actions for AI-powered email productivity.",
    url: "https://mailpilot.shubhojeet.com",
    type: "website",
  },
  twitter: {
    title: "MailPilot - AI-Powered Email Assistant",
    description:
      "Control Gmail with natural language. Filter mail, open threads, draft replies, and queue actions for AI-powered email productivity.",
    card: "summary_large_image",
  },
};

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/inbox");
  }

  return <LandingPage />;
}
