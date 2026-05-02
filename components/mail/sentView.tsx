"use client";

import { EmailListView } from "./emailListView";
import EmailListItem from "./sentEmailListItem";
import { mailLabelSchema } from "@/lib/mail/types";

export function SentView() {
  return (
    <EmailListView
      label={mailLabelSchema.enum.SENT}
      title="Sent"
      listItemComponent={EmailListItem}
      showRecipientFilter={true}
    />
  );
}
