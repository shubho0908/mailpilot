"use client";

import { EmailListView } from "./emailListView";
import EmailListItem from "./inboxEmailListItem";
import { mailLabelSchema } from "@/lib/mail/types";

export function Inbox() {
  return (
    <EmailListView
      label={mailLabelSchema.enum.INBOX}
      title="Inbox"
      listItemComponent={EmailListItem}
      showRecipientFilter={false}
    />
  );
}
