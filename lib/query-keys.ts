const emailListRoot = ["emails", "list"];
const emailDetailRoot = ["email", "detail"];
const emailThreadRoot = ["email", "thread"];

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
    ) => [
      ...emailListRoot,
      {
        label,
        maxResults,
        page,
        pageToken,
        query,
        from,
        to,
        subject,
        after,
        before,
        unread,
      },
    ],
  },
  email: {
    all: ["email"],
    details: () => emailDetailRoot,
    detail: (id: string) => [...emailDetailRoot, id],
    threads: () => emailThreadRoot,
    thread: (id: string) => [...emailThreadRoot, id],
  },
};
