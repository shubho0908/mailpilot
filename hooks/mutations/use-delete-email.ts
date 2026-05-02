import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Email } from "@/services/gmail/gmail.types";
import { toast } from "sonner";

interface DeleteEmailVariables {
  id: string;
}

interface EmailsCache {
  emails: Email[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: DeleteEmailVariables) => {
      const response = await fetch("/api/mail/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error("Failed to delete email");
      }

      return response.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.emails.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.email.threads() });

      const previousEmails = queryClient.getQueriesData<EmailsCache>({
        queryKey: queryKeys.emails.lists(),
      });

      queryClient.setQueriesData<EmailsCache>({ queryKey: queryKeys.emails.lists() }, (old) =>
        old
          ? {
              ...old,
              emails: old.emails.filter((email) => email.id !== variables.id),
            }
          : old
      );

      return { previousEmails };
    },
    onError: (error, variables, context) => {
      for (const [queryKey, data] of context?.previousEmails ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
      toast.error(error instanceof Error ? error.message : "Failed to delete email");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.email.threads() });
      toast.success("Email deleted successfully");
    },
  });
}
