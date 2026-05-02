import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

interface SendEmailVariables {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: SendEmailVariables) => {
      const response = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.lists(), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: queryKeys.email.threads(), refetchType: "all" });
      queryClient.invalidateQueries({
        queryKey: queryKeys.emails.list("SENT"),
        refetchType: "all",
      });
      toast.success("Email sent successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    },
  });
}
