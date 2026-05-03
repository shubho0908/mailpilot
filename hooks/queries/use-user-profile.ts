import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  hasApiKey: boolean;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store" });

  if (response.status === 401 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json();
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => fetchJson<UserProfile>("/api/user/me"),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useSaveApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to save API key");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}
