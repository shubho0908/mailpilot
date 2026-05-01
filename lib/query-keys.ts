export const queryKeys = {
  emails: {
    all: ["emails"] as const,
    lists: () => [...queryKeys.emails.all, "list"] as const,
    list: (
      label: string,
      page?: number,
      pageToken?: string,
      query?: string,
      from?: string,
      to?: string,
      subject?: string,
      after?: string,
      before?: string
    ) => {
      const baseKey = [...queryKeys.emails.lists(), label] as const;
      const key: (string | number)[] = [...baseKey];
      if (page !== undefined) key.push(page.toString());
      if (pageToken) key.push(pageToken);
      if (query) key.push(query);
      if (from) key.push(from);
      if (to) key.push(to);
      if (subject) key.push(subject);
      if (after) key.push(after);
      if (before) key.push(before);
      return key;
    },
  },
  email: {
    all: ["email"] as const,
    details: () => [...queryKeys.email.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.email.details(), id] as const,
  },
} as const;
