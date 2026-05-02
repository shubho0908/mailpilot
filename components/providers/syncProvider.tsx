"use client";

import { useMailRealtime } from "@/hooks/use-mail-realtime";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useMailRealtime();

  return <>{children}</>;
}
