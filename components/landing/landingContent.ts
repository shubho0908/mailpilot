import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Fingerprint,
  Forward,
  MailCheck,
  MessageSquareText,
  Reply,
  Search,
  SlidersHorizontal,
  Sparkle,
  Trash2,
} from "lucide-react";

export const navItems = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
];

export type PreviewMail = {
  id: string;
  folder: "inbox" | "sent";
  sender: string;
  email: string;
  recipient: string;
  subject: string;
  time: string;
  snippet: string;
  body: string;
  status: "Read" | "Unread" | "Sent";
};

export const inboxItems: PreviewMail[] = [
  {
    id: "mira-contract",
    folder: "inbox",
    sender: "Mira Patel",
    email: "mira@northline.co",
    recipient: "To: you@company.com",
    subject: "Partner contract notes",
    time: "09:42",
    snippet: "I added the renewal language and the liability note we discussed.",
    body: "I added the renewal language and the liability note we discussed. Can you confirm whether the renewal window should stay at 45 days before I send the final copy?",
    status: "Unread",
  },
  {
    id: "owen-launch",
    folder: "inbox",
    sender: "Owen Larsen",
    email: "owen@harbor.dev",
    recipient: "To: you@company.com",
    subject: "Updated launch checklist",
    time: "08:18",
    snippet: "The final QA pass is attached. Can you check the last item?",
    body: "The final QA pass is attached. Can you check the last item and reply with any release blockers before the end of the day?",
    status: "Read",
  },
  {
    id: "priya-investor",
    folder: "inbox",
    sender: "Priya Nair",
    email: "priya@ledgerbay.com",
    recipient: "To: you@company.com",
    subject: "Follow-up from investor call",
    time: "Yesterday",
    snippet: "Sending the notes from the call and the open diligence questions.",
    body: "Sending the notes from the call and the open diligence questions. The team mainly needs confirmation on timing and the updated reporting export.",
    status: "Read",
  },
];

export const sentItems: PreviewMail[] = [
  {
    id: "sent-roadmap",
    folder: "sent",
    sender: "You",
    email: "you@company.com",
    recipient: "To: anika@clearpath.studio",
    subject: "Roadmap notes",
    time: "10:18",
    snippet: "Sharing the cleaned roadmap notes and the two decisions from yesterday.",
    body: "Sharing the cleaned roadmap notes and the two decisions from yesterday. I also called out the tasks that should wait until the API-key setup path is stable.",
    status: "Sent",
  },
  {
    id: "sent-vendor",
    folder: "sent",
    sender: "You",
    email: "you@company.com",
    recipient: "To: devon@northstar.tools",
    subject: "Vendor security reply",
    time: "Yesterday",
    snippet: "Thanks for the details. We will review the auth flow and follow up.",
    body: "Thanks for the details. We will review the auth flow and follow up after checking the Gmail watch renewal path.",
    status: "Sent",
  },
];

export const previewFilters = ["Search emails...", "From", "To", "Sender", "Unread"];

export const previewActions = [
  { label: "Reply", icon: Reply },
  { label: "Forward", icon: Forward },
  { label: "Delete", icon: Trash2 },
];

export const composeDraft = {
  subject: "Re: Partner contract notes",
  cc: "legal@company.com",
  replyBody:
    "Thanks for sending this through.\n\nPlease keep the renewal window at 45 days. The updated liability language looks good to me.",
  forwardBody:
    "Forwarding this thread for review.\n\nCan you confirm whether the renewal window should remain at 45 days before we respond?",
};

export const featurePanels = [
  {
    icon: MessageSquareText,
    title: "Control by intent",
    description:
      "Tell the agent what you want. It opens Compose, fills the draft, and keeps it editable.",
    detail: "The interface responds to instructions.",
    className: "md:col-span-7",
  },
  {
    icon: Search,
    title: "Navigate by asking",
    description: "Ask for a thread, sender, or filter. The agent builds the view you need.",
    detail: "Gmail search becomes a UI action.",
    className: "md:col-span-5",
  },
  {
    icon: SlidersHorizontal,
    title: "Triage as a live surface",
    description:
      "Filters, messages, and compose stay visible. The agent never hides what it changes.",
    detail: "The raw inbox stays close.",
    className: "md:col-span-5",
  },
  {
    icon: Fingerprint,
    title: "Bounded by approval",
    description: "Send and delete wait for your review. Every action stays visible.",
    detail: "No silent actions, no mystery state.",
    className: "md:col-span-7",
  },
];

export const workflowSteps = [
  {
    icon: ArrowDownToLine,
    title: "Connect Gmail",
    description: "Sign in once. The workspace gets inbox, sent, and thread access.",
  },
  {
    icon: Sparkle,
    title: "Tell the agent what you need",
    description: "Ask for a reply, search, or action in plain language.",
  },
  {
    icon: Check,
    title: "Review and approve",
    description: "Inspect the UI, edit drafts if needed, and approve before anything sends.",
  },
];

export const footerLinks = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
];

export const actionLinks = [
  {
    label: "View workflow",
    href: "#workflow",
    icon: ArrowRight,
  },
  {
    label: "Explore product",
    href: "#product",
    icon: MailCheck,
  },
];
