import { getCurrentSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landingPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MailPilot - An AI agent for your email UI",
  description:
    "MailPilot lets an AI agent operate your email workspace: filter mail, open threads, draft replies, and queue send or delete actions for approval.",
};

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/inbox");
  }

  return <LandingPage />;
}
