import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Email } from "@/services/gmail/gmail.types";

interface UseEmailsOptions {
  label?: "INBOX" | "SENT";
  pageToken?: string;
  query?: string;
  from?: string;
  to?: string;
  subject?: string;
  after?: string;
  before?: string;
}

interface EmailsResponse {
  emails: Email[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export function useEmails({
  label = "INBOX",
  pageToken,
  query,
  from,
  to,
  subject,
  after,
  before,
}: UseEmailsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.emails.list(label, undefined, pageToken, query, from, to, subject, after, before),
    queryFn: async (): Promise<EmailsResponse> => {
      const params = new URLSearchParams({ label });
      if (pageToken) {
        params.append("pageToken", pageToken);
      }
      if (query) {
        params.append("query", query);
      }
      if (from) {
        params.append("from", from);
      }
      if (to) {
        params.append("to", to);
      }
      if (subject) {
        params.append("subject", subject);
      }
      if (after) {
        params.append("after", after);
      }
      if (before) {
        params.append("before", before);
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
