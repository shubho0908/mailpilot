import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SyncStatus } from "@/lib/sync/constants";

interface SyncState {
  status: SyncStatus;
  gmailWatchStatus: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
}

interface SyncActions {
  setStatus: (status: SyncStatus) => void;
  setGmailWatchStatus: (status: SyncStatus) => void;
  markSynced: () => void;
  setError: (error: string) => void;
}

export const useSyncStore = create<SyncState & SyncActions>()(
  devtools(
    (set) => ({
      status: SyncStatus.Idle,
      gmailWatchStatus: SyncStatus.Idle,
      lastSyncedAt: null,
      error: null,
      setStatus: (status) => set({ status, error: null }, false, "setSyncStatus"),
      setGmailWatchStatus: (gmailWatchStatus) =>
        set({ gmailWatchStatus }, false, "setGmailWatchStatus"),
      markSynced: () =>
        set(
          { status: SyncStatus.Live, lastSyncedAt: new Date().toISOString(), error: null },
          false,
          "markSynced"
        ),
      setError: (error) => set({ error }, false, "setSyncError"),
    }),
    { name: "SyncStore" }
  )
);
