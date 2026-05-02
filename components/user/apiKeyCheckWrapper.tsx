"use client";

import { useEffect, useState } from "react";
import { ApiKeySetupModal } from "./apiKeySetupModal";
import { useCurrentUser } from "@/hooks/queries/use-user-profile";

export function ApiKeyCheckWrapper({ children }: { children: React.ReactNode }) {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (user && !user.hasApiKey) {
      setShowSetupModal(true);
    }
  }, [user]);

  return (
    <>
      {children}
      <ApiKeySetupModal
        open={!isLoading && showSetupModal}
        onOpenChange={setShowSetupModal}
        onComplete={() => setShowSetupModal(false)}
      />
    </>
  );
}
