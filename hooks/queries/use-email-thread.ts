import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Email, EmailThread } from "@/services/gmail/gmail.types";

interface EmailThreadResponse {
  email: Email;
  thread: EmailThread;
}

export function useEmailThread(emailId: string) {
  return useQuery({
    queryKey: queryKeys.email.thread(emailId),
    queryFn: async (): Promise<EmailThreadResponse> => {
      const response = await fetch(`/api/mail/message/${emailId}/thread`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch email thread");
      }
      const data = await response.json();
      return {
        email: data.email,
        thread: data.thread,
      };
    },
    enabled: !!emailId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
