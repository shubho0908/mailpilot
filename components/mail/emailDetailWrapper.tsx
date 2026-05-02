"use client";

import { EmailDetail } from "./emailDetail";
import { useRouter, usePathname } from "next/navigation";
import { mailViewSchema, pathForMailRoute } from "@/lib/mail/types";

interface EmailDetailWrapperProps {
  emailId: string;
}

export function EmailDetailWrapper({ emailId }: EmailDetailWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inboxPath = pathForMailRoute(mailViewSchema.enum.inbox);
  const sentPath = pathForMailRoute(mailViewSchema.enum.sent);

  const handleBack = () => {
    if (pathname.startsWith(inboxPath)) {
      router.push(inboxPath);
    } else if (pathname.startsWith(sentPath)) {
      router.push(sentPath);
    } else {
      router.push(inboxPath);
    }
  };

  return <EmailDetail emailId={emailId} onBack={handleBack} />;
}
