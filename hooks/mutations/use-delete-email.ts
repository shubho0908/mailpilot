import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

interface DeleteEmailVariables {
  id: string;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.lists(), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: queryKeys.email.threads(), refetchType: "all" });
      toast.success("Email deleted successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete email");
    },
  });
}
