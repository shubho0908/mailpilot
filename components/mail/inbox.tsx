"use client";

import { EmailListView } from "./emailListView";
import EmailListItem from "./inboxEmailListItem";

export function Inbox() {
  return (
    <EmailListView
      label="INBOX"
      title="Inbox"
      listItemComponent={EmailListItem}
      showRecipientFilter={false}
    />
  );
}
