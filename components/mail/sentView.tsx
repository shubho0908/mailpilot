"use client";

import { EmailListView } from "./emailListView";
import EmailListItem from "./sentEmailListItem";

export function SentView() {
  return (
    <EmailListView
      label="SENT"
      title="Sent"
      listItemComponent={EmailListItem}
      showRecipientFilter={true}
    />
  );
}
