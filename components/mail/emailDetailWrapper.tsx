"use client";

import { EmailDetail } from "./emailDetail";
import { useRouter } from "next/navigation";
import { mailViewSchema, pathForMailRoute } from "@/lib/mail/types";

interface EmailDetailWrapperProps {
  emailId: string;
}

export function EmailDetailWrapper({ emailId }: EmailDetailWrapperProps) {
  const router = useRouter();
  const { push } = router;
  const inboxPath = pathForMailRoute(mailViewSchema.enum.inbox);
  const sentPath = pathForMailRoute(mailViewSchema.enum.sent);

  const handleBack = () => {
    const pathname = window.location.pathname;
    if (pathname.startsWith(inboxPath)) {
      push(inboxPath);
    } else if (pathname.startsWith(sentPath)) {
      push(sentPath);
    } else {
      push(inboxPath);
    }
  };

  return <EmailDetail emailId={emailId} onBack={handleBack} />;
}
