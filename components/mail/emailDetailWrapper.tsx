"use client";

import { EmailDetail } from "./emailDetail";
import { useRouter, usePathname } from "next/navigation";

interface EmailDetailWrapperProps {
  emailId: string;
}

export function EmailDetailWrapper({ emailId }: EmailDetailWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (pathname.startsWith("/inbox")) {
      router.push("/inbox");
    } else if (pathname.startsWith("/sent")) {
      router.push("/sent");
    } else {
      router.push("/inbox");
    }
  };

  return <EmailDetail emailId={emailId} onBack={handleBack} />;
}
