import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Email } from "@/services/gmail/gmail.types";

export function useEmail(emailId: string) {
  return useQuery({
    queryKey: queryKeys.email.detail(emailId),
    queryFn: async (): Promise<Email> => {
      const response = await fetch(`/api/mail/message/${emailId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch email");
      }
      const data = await response.json();
      return data.email;
    },
    enabled: !!emailId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
