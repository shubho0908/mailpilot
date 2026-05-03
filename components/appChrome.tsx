"use client";

import { AssistantPanel } from "@/components/mail/assistantPanel";
import { SyncProvider } from "@/components/providers/syncProvider";
import { ApiKeyCheckWrapper } from "@/components/user/apiKeyCheckWrapper";
import { UserProfileDropdownWrapper } from "@/components/user/userProfileDropdownWrapper";
import { usePathname } from "next/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <SyncProvider>
      <ApiKeyCheckWrapper>
        {children}
        <AssistantPanel />
        <UserProfileDropdownWrapper />
      </ApiKeyCheckWrapper>
    </SyncProvider>
  );
}
