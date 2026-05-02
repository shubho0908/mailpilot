"use client";

import { useState } from "react";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncStore } from "@/lib/store/sync-store";
import { SyncStatus } from "@/lib/sync/constants";

const statusLabel: Record<SyncStatus, string> = {
  [SyncStatus.Idle]: "Sync idle",
  [SyncStatus.Connecting]: "Connecting...",
  [SyncStatus.Live]: "Live",
  [SyncStatus.Syncing]: "Syncing...",
  [SyncStatus.Error]: "Sync issue",
  [SyncStatus.Disabled]: "Sync unavailable",
  [SyncStatus.Partial]: "Gmail sync active",
};

const statusDescription: Record<SyncStatus, string> = {
  [SyncStatus.Idle]: "Sync is idle",
  [SyncStatus.Connecting]: "Connecting to Gmail",
  [SyncStatus.Live]: "Synced with Gmail",
  [SyncStatus.Syncing]: "Syncing emails",
  [SyncStatus.Error]: "Sync failed",
  [SyncStatus.Disabled]: "Sync disabled",
  [SyncStatus.Partial]: "Partial sync active",
};

export function SyncStatusIndicator() {
  const status = useSyncStore((state) => state.status);
  const error = useSyncStore((state) => state.error);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const [isOpen, setIsOpen] = useState(false);
  const label = error || statusLabel[status];
  const isPartial = status === SyncStatus.Partial;
  const isBusy = status === SyncStatus.Connecting || status === SyncStatus.Syncing;
  const isUnavailable = status === SyncStatus.Error || status === SyncStatus.Disabled;

  const tooltipContent = lastSyncedAt
    ? `${statusDescription[status]} • ${new Date(lastSyncedAt).toLocaleTimeString()}`
    : statusDescription[status];

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={cn(
          "hidden sm:flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium tracking-tight cursor-pointer",
          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
          status === SyncStatus.Live &&
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
          isBusy && "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
          isPartial && "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
          isUnavailable && "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"
        )}
        aria-label={label}
        role="button"
        tabIndex={0}
      >
        {isBusy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : isUnavailable ? (
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        ) : isPartial ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span>{label}</span>
      </div>
      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={cn(
            "absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50",
            "bg-foreground text-background px-4 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg border border-border",
            "animate-in fade-in slide-in-from-top-1 duration-200"
          )}
        >
          <p>{tooltipContent}</p>
        </div>
      )}
    </div>
  );
}
