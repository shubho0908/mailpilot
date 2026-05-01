export const queryKeys = {
  emails: {
    all: ["emails"] as const,
    lists: () => [...queryKeys.emails.all, "list"] as const,
    list: (label: string, page?: number, pageToken?: string) => {
      const baseKey = [...queryKeys.emails.lists(), label] as const;
      if (page === undefined && !pageToken) return baseKey;
      const key: (string | number)[] = [...baseKey];
      if (page !== undefined) key.push(page.toString());
      if (pageToken) key.push(pageToken);
      return key as readonly (string | number)[];
    },
  },
  email: {
    all: ["email"] as const,
    details: () => [...queryKeys.email.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.email.details(), id] as const,
  },
} as const;
