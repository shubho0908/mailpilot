import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface SendEmailVariables {
  to: string;
  subject: string;
  body: string;
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.emails.list("SENT"),
        refetchType: "all",
      });
    },
  });
}
