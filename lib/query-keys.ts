const emailListRoot = ["emails", "list"];
const emailDetailRoot = ["email", "detail"];

export const queryKeys = {
  emails: {
    all: ["emails"],
    lists: () => emailListRoot,
    list: (
      label: string,
      maxResults?: number,
      page?: number,
      pageToken?: string,
      query?: string,
      from?: string,
      to?: string,
      subject?: string,
      after?: string,
      before?: string,
      unread?: boolean
    ) => {
      const key: (string | number)[] = [...emailListRoot, label];
      if (maxResults !== undefined) key.push(maxResults.toString());
      if (page !== undefined) key.push(page.toString());
      if (pageToken) key.push(pageToken);
      if (query) key.push(query);
      if (from) key.push(from);
      if (to) key.push(to);
      if (subject) key.push(subject);
      if (after) key.push(after);
      if (before) key.push(before);
      if (unread !== undefined) key.push(unread ? "unread" : "read");
      return key;
    },
  },
  email: {
    all: ["email"],
    details: () => emailDetailRoot,
    detail: (id: string) => [...emailDetailRoot, id],
  },
};
