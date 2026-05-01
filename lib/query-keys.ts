export const queryKeys = {
  emails: {
    all: ["emails"] as const,
    lists: () => [...queryKeys.emails.all, "list"] as const,
    list: (label: string) => [...queryKeys.emails.lists(), label] as const,
  },
  email: {
    all: ["email"] as const,
    details: () => [...queryKeys.email.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.email.details(), id] as const,
  },
} as const;
