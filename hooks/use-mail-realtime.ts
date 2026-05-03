"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useSyncStore } from "@/lib/store/sync-store";
import { SyncStatus } from "@/lib/sync/constants";
import { mailChangedEventSchema } from "@/lib/sync/events";
import { toast } from "sonner";

const RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;
const POLLING_FALLBACK_INTERVAL_MS = 30000;

async function setupGmailWatch(): Promise<boolean> {
  try {
    const response = await fetch("/api/mail/sync/watch", {
      method: "POST",
    });

    if (response.status === 401) {
      return false;
    }

    return response.ok;
  } catch {
    return false;
  }
}

export function useMailRealtime() {
  const queryClient = useQueryClient();
  const setStatus = useSyncStore((state) => state.setStatus);
  const setGmailWatchStatus = useSyncStore((state) => state.setGmailWatchStatus);
  const setError = useSyncStore((state) => state.setError);
  const markSynced = useSyncStore((state) => state.markSynced);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingFallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let disposed = false;

    function clearReconnectTimeout() {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }

    function closeEventSource() {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }

    async function refreshMailQueries() {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.emails.lists(),
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.email.threads(),
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.email.details(),
          refetchType: "active",
        }),
      ]);
    }

    function startPollingFallback() {
      if (pollingFallbackRef.current) return;

      pollingFallbackRef.current = setInterval(() => {
        refreshMailQueries().catch((error) => {
          setError(error instanceof Error ? error.message : "Realtime sync polling failed");
        });
      }, POLLING_FALLBACK_INTERVAL_MS);
    }

    function stopPollingFallback() {
      if (pollingFallbackRef.current) {
        clearInterval(pollingFallbackRef.current);
        pollingFallbackRef.current = null;
      }
    }

    async function connect() {
      try {
        clearReconnectTimeout();
        closeEventSource();
        setStatus(SyncStatus.Connecting);
        setGmailWatchStatus(SyncStatus.Connecting);

        const watchReady = await setupGmailWatch();
        if (!watchReady || disposed) {
          setGmailWatchStatus(SyncStatus.Error);
          setStatus(SyncStatus.Partial);
          startPollingFallback();
          return;
        }
        setGmailWatchStatus(SyncStatus.Live);

        eventSourceRef.current = new EventSource("/api/realtime/events");

        eventSourceRef.current.onopen = () => {
          if (!disposed) {
            stopPollingFallback();
            setStatus(SyncStatus.Live);
            reconnectAttemptsRef.current = 0;
          }
        };

        eventSourceRef.current.onerror = () => {
          if (!disposed) {
            setStatus(SyncStatus.Partial);
            setError("Realtime sync connection failed");

            reconnectAttemptsRef.current++;
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              reconnectTimeoutRef.current = setTimeout(
                connect,
                RECONNECT_DELAY_MS * reconnectAttemptsRef.current
              );
            } else {
              startPollingFallback();
            }
          }
        };

        eventSourceRef.current.onmessage = (event) => {
          if (disposed) return;

          try {
            const parsed = mailChangedEventSchema.safeParse(JSON.parse(event.data));
            if (!parsed.success) {
              return;
            }

            if (parsed.data.addedMessageIds.length > 0) {
              toast.success("New email received", {
                duration: 3000,
                position: "bottom-right",
              });
            }

            refreshMailQueries()
              .catch((error) => {
                setError(error instanceof Error ? error.message : "Realtime sync refresh failed");
              })
              .finally(() => {
                if (!disposed) {
                  markSynced();
                }
              });
          } catch (error) {
            setError(error instanceof Error ? error.message : "Realtime sync event parsing failed");
          }
        };
      } catch (error) {
        if (!disposed) {
          setGmailWatchStatus(SyncStatus.Error);
          setStatus(SyncStatus.Partial);
          setError(error instanceof Error ? error.message : "Realtime sync failed to start");
          startPollingFallback();
        }
      }
    }

    connect();

    return () => {
      disposed = true;
      clearReconnectTimeout();
      stopPollingFallback();
      closeEventSource();
    };
  }, [markSynced, queryClient, setStatus, setGmailWatchStatus, setError]);
}
