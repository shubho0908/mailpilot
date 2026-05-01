import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Email } from "@/services/gmail/gmail.types";

interface UseEmailsOptions {
  label?: "INBOX" | "SENT";
  pageToken?: string;
}

interface EmailsResponse {
  emails: Email[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export function useEmails({ label = "INBOX", pageToken }: UseEmailsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.emails.list(label, undefined, pageToken),
    queryFn: async (): Promise<EmailsResponse> => {
      const params = new URLSearchParams({ label });
      if (pageToken) {
        params.append("pageToken", pageToken);
      }
      const response = await fetch(`/api/mail/inbox?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }
      const data = await response.json();

      return {
        emails: data.emails || [],
        nextPageToken: data.nextPageToken,
        resultSizeEstimate: data.resultSizeEstimate,
      };
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
