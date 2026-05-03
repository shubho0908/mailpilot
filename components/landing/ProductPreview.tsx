"use client";

import {
  composeDraft,
  inboxItems,
  previewActions,
  previewFilters,
  sentItems,
  type PreviewMail,
} from "@/components/landing/landingContent";
import { cn } from "@/lib/utils";
import { Check, MessageSquareText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type PreviewView = "inbox" | "sent" | "compose";
type AssistantState = "idle" | "reply" | "forward" | "delete" | "approved" | "rejected";

const views: { label: string; value: PreviewView }[] = [
  { label: "Inbox", value: "inbox" },
  { label: "Sent", value: "sent" },
  { label: "Compose", value: "compose" },
];

function getInitialMail(view: PreviewView) {
  return view === "sent" ? sentItems[0] : inboxItems[0];
}

export function ProductPreview() {
  const [view, setView] = useState<PreviewView>("inbox");
  const [selectedMailId, setSelectedMailId] = useState(inboxItems[0].id);
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Sender");
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");

  const currentItems = view === "sent" ? sentItems : inboxItems;
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return currentItems.filter((item) => {
      if (unreadOnly && item.status !== "Unread") return false;
      if (!normalizedQuery) return true;

      return [item.sender, item.email, item.subject, item.snippet]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [currentItems, query, unreadOnly]);

  const selectedMail =
    filteredItems.find((item) => item.id === selectedMailId) ||
    filteredItems[0] ||
    currentItems.find((item) => item.id === selectedMailId) ||
    currentItems[0];

  function handleViewChange(nextView: PreviewView) {
    setView(nextView);
    setSelectedMailId(getInitialMail(nextView).id);
    setAssistantState(nextView === "compose" ? "reply" : "idle");
    setQuery("");
    setUnreadOnly(false);
    setActiveFilter(nextView === "sent" ? "To" : "Sender");
  }

  function handleMailSelect(item: PreviewMail) {
    setSelectedMailId(item.id);
    setView(item.folder);
    setAssistantState("idle");
  }

  function handleAction(action: string) {
    if (action === "Reply") {
      setView("compose");
      setAssistantState("reply");
      return;
    }

    if (action === "Forward") {
      setView("compose");
      setAssistantState("forward");
      return;
    }

    setAssistantState("delete");
  }

  const hasResults = filteredItems.length > 0;
  const visibleMail = hasResults ? filteredItems : currentItems.slice(0, 1);

  return (
    <aside
      aria-label="Interactive MailPilot product preview"
      className="landing-reveal relative mx-auto w-full max-w-[430px] [animation-delay:120ms] sm:max-w-[600px] md:max-w-[820px] lg:max-w-[920px] xl:mr-0 xl:max-w-[980px]"
    >
      <div className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-tray)] p-1.5 shadow-[0_24px_80px_var(--landing-shadow)] sm:p-2">
        <div className="overflow-hidden rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)]">
          <PreviewChrome />

          <div className="border-b border-[var(--landing-border)] bg-[var(--landing-bg)] px-2.5 py-2.5 sm:px-4 sm:py-3 md:px-3 md:py-2.5 lg:px-4 lg:py-3">
            <div className="flex flex-wrap items-center gap-2">
              {views.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={view === item.value}
                  onClick={() => handleViewChange(item.value)}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98] sm:text-xs",
                    view === item.value
                      ? "bg-[var(--landing-inverse)] text-[var(--landing-inverse-text)]"
                      : "border border-[var(--landing-border)] text-[var(--landing-muted)] hover:bg-[var(--landing-soft)] hover:text-[var(--landing-text)]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-[1fr_repeat(4,auto)] sm:gap-2 md:mt-2">
              <label className="col-span-2 flex min-w-0 items-center rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] px-2.5 py-1.5 text-xs text-[var(--landing-faint)] sm:col-span-1 sm:min-w-44 sm:py-2">
                <Search
                  className="mr-1.5 size-3 text-[var(--landing-accent)]"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search emails..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-[var(--landing-text)] outline-none placeholder:text-[var(--landing-faint)]"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="cursor-pointer ml-2 rounded-sm text-[var(--landing-faint)] transition-colors hover:text-[var(--landing-text)]"
                  >
                    <X className="size-3" strokeWidth={1.8} aria-hidden="true" />
                  </button>
                )}
              </label>

              {previewFilters.slice(1).map((filter) => {
                const isUnread = filter === "Unread";
                const isActive = isUnread ? unreadOnly : activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      if (isUnread) {
                        setUnreadOnly((value) => !value);
                      } else {
                        setActiveFilter(filter);
                      }
                    }}
                    className={cn(
                      "cursor-pointer min-w-0 truncate rounded-md border px-2 py-1.5 text-[11px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98] sm:px-2.5 sm:py-2 sm:text-xs",
                      isActive
                        ? "border-[var(--landing-accent-border)] bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]"
                        : "border-[var(--landing-border)] bg-[var(--landing-panel)] text-[var(--landing-faint)] hover:bg-[var(--landing-soft)] hover:text-[var(--landing-text)]"
                    )}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {view === "compose" ? (
            <ComposePreview
              assistantState={assistantState}
              selectedMail={selectedMail}
              onApprove={() => setAssistantState("approved")}
              onReject={() => setAssistantState("rejected")}
            />
          ) : (
            <MailPreview
              activeFilter={activeFilter}
              assistantState={assistantState}
              hasResults={hasResults}
              selectedMail={selectedMail}
              visibleMail={visibleMail}
              view={view}
              onAction={handleAction}
              onApprove={() => setAssistantState("approved")}
              onReject={() => setAssistantState("rejected")}
              onSelect={handleMailSelect}
            />
          )}
        </div>
      </div>
    </aside>
  );
}

function PreviewChrome() {
  return (
    <div className="flex items-center justify-between border-b border-[var(--landing-border)] px-3 py-2.5 sm:px-4 sm:py-3 md:py-2.5 lg:py-3">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-[3px] bg-[var(--landing-bead)] sm:size-2.5" />
        <span className="size-2 rounded-[3px] bg-[var(--landing-bead)] sm:size-2.5" />
        <span className="size-2 rounded-[3px] bg-[var(--landing-accent)] sm:size-2.5" />
      </div>
      <span className="font-mono text-[11px] text-[var(--landing-faint)] sm:text-xs">mailpilot.app</span>
    </div>
  );
}

function MailPreview({
  activeFilter,
  assistantState,
  hasResults,
  selectedMail,
  visibleMail,
  view,
  onAction,
  onApprove,
  onReject,
  onSelect,
}: {
  activeFilter: string;
  assistantState: AssistantState;
  hasResults: boolean;
  selectedMail: PreviewMail;
  visibleMail: PreviewMail[];
  view: Exclude<PreviewView, "compose">;
  onAction: (action: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onSelect: (item: PreviewMail) => void;
}) {
  return (
    <div
      key={view}
      className="landing-preview-swap grid h-[430px] grid-cols-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden sm:h-[460px] md:h-[420px] md:grid-cols-[minmax(0,0.76fr)_minmax(0,1.08fr)_minmax(0,0.82fr)] md:grid-rows-1 lg:h-[460px] xl:h-[500px] xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.08fr)_minmax(0,0.9fr)]"
    >
      <div className="hidden min-h-0 min-w-0 overflow-hidden border-b border-[var(--landing-border)] bg-[var(--landing-bg)] p-2.5 sm:p-3 md:block md:border-b-0 md:border-r md:p-3 lg:p-4">
        <div className="mb-2.5 flex items-center justify-between gap-3 md:mb-3 lg:mb-4">
          <span className="text-xs font-semibold sm:text-sm">{view === "sent" ? "Sent" : "Inbox"}</span>
          <span className="text-xs text-[var(--landing-faint)]">{activeFilter}</span>
        </div>
        <div className="grid grid-cols-[repeat(2,minmax(180px,1fr))] gap-2 overflow-x-auto md:block md:h-[calc(100%-2rem)] md:space-y-2 md:overflow-y-auto md:overflow-x-hidden">
          {visibleMail.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "cursor-pointer block w-full rounded-md border p-2.5 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.99] sm:p-3 md:p-2.5 lg:p-3",
                index > 1 && "hidden md:block",
                item.id === selectedMail.id
                  ? "border-[var(--landing-accent-border)] bg-[var(--landing-accent-soft)]"
                  : "border-[var(--landing-border)] bg-[var(--landing-panel)] hover:bg-[var(--landing-soft)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xs font-semibold leading-5 text-[var(--landing-text)] sm:text-sm">
                    {item.sender}
                  </h2>
                  <p className="truncate font-mono text-[10px] leading-5 text-[var(--landing-faint)]">
                    {item.email}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--landing-muted)]">
                    {item.subject}
                  </p>
                </div>
                <time className="font-mono text-[11px] text-[var(--landing-faint)]">
                  {item.time}
                </time>
              </div>
              <p className="mt-2 text-[11px] font-medium text-[var(--landing-accent)] sm:mt-3 sm:text-xs">{item.status}</p>
              <p className="mt-1 line-clamp-1 text-[11px] leading-5 text-[var(--landing-copy)] sm:line-clamp-2 sm:text-xs md:line-clamp-1 lg:line-clamp-2">
                {item.snippet}
              </p>
            </button>
          ))}

          {!hasResults && (
            <div className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] p-3 text-xs leading-5 text-[var(--landing-copy)]">
              No preview mail matched that search. Clear the search to restore the list.
            </div>
          )}
        </div>
      </div>

      <MessageDetail selectedMail={selectedMail} onAction={onAction} />

      <AssistantPreview
        assistantState={assistantState}
        selectedMail={selectedMail}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}

function MessageDetail({
  selectedMail,
  onAction,
}: {
  selectedMail: PreviewMail;
  onAction: (action: string) => void;
}) {
  return (
    <div
      key={selectedMail.id}
      className="landing-preview-swap min-h-0 min-w-0 overflow-y-auto border-b border-[var(--landing-border)] p-3 sm:p-4 md:border-b-0 md:border-r md:p-4 lg:p-5"
    >
      <div className="mb-3 border-b border-[var(--landing-border)] pb-3 sm:mb-4 sm:pb-4 lg:mb-5 lg:pb-5">
        <p className="text-xs font-medium text-[var(--landing-accent)]">Email</p>
        <h2 className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.03em] sm:text-2xl md:text-[1.35rem] lg:text-2xl">
          {selectedMail.subject}
        </h2>
        <div className="mt-3 flex items-start gap-3 sm:mt-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[var(--landing-accent-soft)] text-sm font-semibold text-[var(--landing-accent)] sm:size-10">
            {selectedMail.sender.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{selectedMail.sender}</p>
            <p className="break-all font-mono text-[11px] leading-5 text-[var(--landing-faint)]">
              &lt;{selectedMail.email}&gt;
            </p>
            <p className="mt-1 text-xs text-[var(--landing-muted)]">{selectedMail.recipient}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
          {previewActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => onAction(action.label)}
                className={cn(
                  "cursor-pointer inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98] sm:text-xs",
                  action.label === "Delete"
                    ? "border border-[var(--landing-danger-border)] bg-[var(--landing-danger-soft)] text-[var(--landing-danger)] hover:-translate-y-0.5"
                    : "bg-[var(--landing-inverse)] text-[var(--landing-inverse-text)] hover:-translate-y-0.5"
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <article className="rounded-md border border-[var(--landing-accent-border)] bg-[var(--landing-accent-soft)] p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[var(--landing-panel)] text-sm font-semibold text-[var(--landing-text)] sm:size-8">
            {selectedMail.sender.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-semibold">{selectedMail.sender}</p>
            <p className="font-mono text-[11px] text-[var(--landing-faint)]">{selectedMail.time}</p>
          </div>
        </div>
        <p className="text-xs leading-5 text-[var(--landing-copy)] sm:text-sm sm:leading-6 md:text-xs md:leading-5 lg:text-sm lg:leading-6">{selectedMail.body}</p>
      </article>
    </div>
  );
}

function AssistantPreview({
  assistantState,
  selectedMail,
  onApprove,
  onReject,
}: {
  assistantState: AssistantState;
  selectedMail: PreviewMail;
  onApprove: () => void;
  onReject: () => void;
}) {
  const prompt =
    assistantState === "forward"
      ? `Forward "${selectedMail.subject}" with a short note.`
      : assistantState === "delete"
        ? `Delete "${selectedMail.subject}".`
        : `Reply to ${selectedMail.sender} and keep the response brief.`;

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-y-auto border-t border-[var(--landing-border)] bg-[var(--landing-bg)] p-2.5 sm:p-4 md:border-t-0 md:p-3 lg:p-4">
      <div className="mb-2 flex items-center gap-2 sm:mb-3 md:mb-4">
        <span className="grid size-6 place-items-center rounded-md bg-[var(--landing-accent-soft)] text-[var(--landing-accent)] sm:size-8">
          <MessageSquareText className="size-3.5 sm:size-4" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold sm:text-sm">UI agent</p>
          <p className="hidden text-xs text-[var(--landing-faint)] sm:block">Operates visible mail state</p>
        </div>
      </div>

      <div key={`${assistantState}-${selectedMail.id}`} className="landing-preview-swap space-y-2 sm:space-y-3">
        <div className="hidden max-w-[92%] rounded-md bg-[var(--landing-inverse)] px-3 py-2 text-[11px] leading-5 text-[var(--landing-inverse-text)] sm:ml-auto sm:block sm:text-xs">
          {prompt}
        </div>
        <div className="hidden max-w-[92%] rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] px-3 py-2 text-[11px] leading-5 text-[var(--landing-copy)] sm:block sm:text-xs">
          {assistantCopy(assistantState)}
        </div>
        <ApprovalCard
          assistantState={assistantState}
          selectedMail={selectedMail}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>
    </div>
  );
}

function ApprovalCard({
  assistantState,
  selectedMail,
  onApprove,
  onReject,
}: {
  assistantState: AssistantState;
  selectedMail: PreviewMail;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (assistantState === "approved" || assistantState === "rejected") {
    return (
      <div className="rounded-md border border-[var(--landing-accent-border)] bg-[var(--landing-accent-soft)] p-2 text-xs leading-5 text-[var(--landing-copy)] sm:p-3">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--landing-accent)] sm:mb-2">
          {assistantState === "approved" ? (
            <Check className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <X className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          )}
          {assistantState === "approved" ? "Approved in preview" : "Rejected in preview"}
        </span>
        <p className="hidden sm:block">
          No API call was made. The real app keeps this review step before send or delete.
        </p>
      </div>
    );
  }

  const destructive = assistantState === "delete";

  return (
    <div
      className={cn(
        "rounded-md border p-2 sm:p-3",
        destructive
          ? "border-[var(--landing-danger-border)] bg-[var(--landing-danger-soft)]"
          : "border-[var(--landing-accent-border)] bg-[var(--landing-accent-soft)]"
      )}
    >
      <p className="hidden text-xs font-semibold text-[var(--landing-text)] sm:block">
        {destructive
          ? `Delete "${selectedMail.subject}"?`
          : `Send this ${assistantState === "forward" ? "forward" : "reply"}?`}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:mt-3">
        <button
          type="button"
          onClick={onApprove}
          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md bg-[var(--landing-inverse)] px-2 text-center text-xs font-medium leading-none text-[var(--landing-inverse-text)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98] sm:h-auto sm:py-2"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] px-2 text-center text-xs font-medium leading-none text-[var(--landing-text)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98] sm:h-auto sm:py-2"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function ComposePreview({
  assistantState,
  selectedMail,
  onApprove,
  onReject,
}: {
  assistantState: AssistantState;
  selectedMail: PreviewMail;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="landing-preview-swap grid h-[430px] grid-cols-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden sm:h-[460px] md:h-[420px] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)_minmax(0,0.82fr)] md:grid-rows-1 lg:h-[460px] xl:h-[500px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.82fr)]">
      <div className="hidden min-h-0 min-w-0 overflow-hidden border-b border-[var(--landing-border)] bg-[var(--landing-bg)] p-3 sm:p-4 md:block md:border-b-0 md:border-r md:p-3 lg:p-4">
        <p className="text-sm font-semibold">Compose</p>
        <div className="mt-3 grid gap-2 sm:mt-4 md:block md:space-y-3">
          {[
            ["To", selectedMail.email],
            ["Subject", composeDraft.subject],
            ["Cc", composeDraft.cc],
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-[var(--landing-faint)]">{label}</span>
              <span className="mt-1 block truncate rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] px-3 py-2 text-xs text-[var(--landing-copy)]">
                {value}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="min-h-0 min-w-0 overflow-y-auto border-b border-[var(--landing-border)] p-3 sm:p-4 md:border-b-0 md:border-r md:p-3 lg:p-4">
        <p className="text-sm font-semibold">Draft body</p>
        <div className="mt-3 rounded-md border border-[var(--landing-accent-border)] bg-[var(--landing-accent-soft)] p-3 sm:mt-4 sm:p-4">
          <p className="whitespace-pre-wrap text-xs leading-5 text-[var(--landing-copy)] sm:text-sm sm:leading-6 md:text-xs md:leading-5 lg:text-sm lg:leading-6">
            {assistantState === "forward" ? composeDraft.forwardBody : composeDraft.replyBody}
          </p>
        </div>
      </div>

      <AssistantPreview
        assistantState={assistantState === "idle" ? "reply" : assistantState}
        selectedMail={selectedMail}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}

function assistantCopy(state: AssistantState) {
  if (state === "forward") {
    return "Opened Compose with a forward draft. Review the note before sending.";
  }

  if (state === "delete") {
    return "Queued delete for approval. Nothing is removed from this preview.";
  }

  if (state === "approved") {
    return "Preview accepted the approval locally.";
  }

  if (state === "rejected") {
    return "Preview kept the message unchanged after rejection.";
  }

  return "Opened Compose with a reply draft. Review it before sending.";
}
