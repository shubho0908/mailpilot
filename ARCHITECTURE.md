# Architecture & Engineering Decisions

## Core Idea

AI controls the product through typed actions, not the DOM. The assistant emits structured UI actions that drive the same state layer used by normal user interactions. Frontend state is the source of truth.

## Modular Monolith

I went with a single Next.js app with clean internal boundaries instead of Turborepo or separate services. For a take-home, this avoids setup complexity, reduces deployment overhead, and is easier to run and review. The boundaries are clear enough that I can extract the sync worker or assistant service later if scaling becomes necessary.

## Why Next.js API Routes Over Express

Next.js route handlers handle all the endpoints I need. No separate backend process means simpler deployment and shared TypeScript types between frontend and backend. SSE is sufficient for current requirements, so the control I'd gain from Express isn't worth the complexity.

## OpenAI Structured Output

Type-safe command generation with automatic validation and built-in retry logic. It creates a clear contract between AI and application. The trade-off is provider lock-in, but migration to other providers with similar structured output is straightforward.

## Gmail Integration: Direct API

Direct Gmail API with custom service wrapper. Gives full control, smaller tool surface, and lets me include UI-only actions that no official tool set would have.

```typescript
export const gmailService = {
  listEmailsPage: (auth, options) => gmail.users.messages.list({...}),
  getEmail: (auth, id) => gmail.users.messages.get({...}),
  getEmailThread: (auth, threadId) => gmail.users.threads.get({...}),
  sendEmail: (auth, payload) => gmail.users.messages.send({...}),
  deleteEmail: (auth, id) => gmail.users.messages.trash({...}),
}
```

## Real-Time Sync

Primary: Gmail Watch → Google Pub/Sub → webhook → history API → SSE to browser. Fallback: 30-second polling if Gmail Watch setup fails or SSE connection errors out. Redis isn't needed unless there are multiple backend instances — it doesn't receive Gmail events by itself anyway.

## Tool Design

User intent is infinite, but product operations are finite. "Show unread emails from this week," "find Sarah's project update," "open the latest email from David" — all of these map to a small set of primitives: list/search, open, fill compose, send, prepare reply, apply filters, modify, navigate, confirmation.

```typescript
type AssistantAction =
  | { type: "FILL_COMPOSE"; payload: { to?: string; subject?: string; body?: string } }
  | {
      type: "SEARCH_EMAILS";
      payload: {
        label?: "INBOX" | "SENT";
        from?: string;
        query?: string;
        after?: string;
        before?: string;
        unread?: boolean;
      };
    }
  | { type: "OPEN_EMAIL"; payload: { emailId: string } }
  | { type: "NAVIGATE"; payload: { view: "inbox" | "sent" | "compose" | "detail" } }
  | { type: "PREPARE_REPLY"; payload: { emailId: string; body?: string } }
  | { type: "REQUEST_CONFIRMATION"; payload: { operation: "send" | "delete"; summary: string } };
```

## Context Awareness

For "reply to this," "open the latest one," "delete this" to work, the assistant needs context: current view, open email, selected IDs, active filters, current draft, latest visible emails.

## Human Confirmation

The assistant shouldn't immediately execute risky actions like sending or deleting. Better flow: user says "delete this email" → UI shows confirmation → user confirms → backend executes.

## Assistant Scope

The assistant controls the mail-product surface (inbox, sent, detail, compose, filters, thread context, confirmation flows) — not random DOM elements, CSS classes, or low-level click operations.

## Why Not LangGraph?

Most flows are simple: understand intent → choose action → execute → update UI. No multi-agent system or complex graph topology is needed. The assistant is mainly doing intent classification, parameter extraction, and action selection.

## Why Not CopilotKit?

CopilotKit requires deploying a backend agent (Copilot Runtime, external MCP server, or their Built-in Agent). For a single-purpose Gmail client, this adds deployment complexity for marginal benefit. The assistant panel, typed actions, and command handlers are straightforward enough to build directly. CopilotKit shines for larger apps with many agents and complex workflows — overkill here.

## Build Order

Gmail OAuth → Inbox/Sent/Detail/Compose → Compose and send via UI → Assistant panel → Typed actions → Assistant fills compose → Assistant filters/searches → Assistant opens emails → Context-aware reply → Confirmation flows → Real-time sync (polling first, then Watch + Pub/Sub if time allows).

## Trade-offs Summary

| Decision                       | Trade-off               | Future Approach                                                                                          |
| ------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Monolith over Turborepo        | Extract later if needed | Split into separate services when the team grows and deployment complexity outweighs simplicity benefits |
| Next.js API over Express       | Less SSE control        | Move real-time connections to a dedicated service if SSE limitations become a bottleneck                 |
| OpenAI structured output       | Provider lock-in        | Build a wrapper that can swap between different AI providers without changing the application logic      |
| Direct Gmail API over MCP      | More code to write      | Add support for other email providers (Outlook, IMAP) by creating a common interface                     |
| Gmail Watch + polling fallback | Pub/Sub complexity      | Simplify to smart polling if the Pub/Sub setup proves too complex for the use case                       |
| Typed actions over DOM control | Requires state layer    | Track which actions are used most to optimize the experience and add new capabilities                    |
| Human confirmation             | Extra step for user     | Learn user trust patterns over time to auto-approve safe actions while keeping risky ones protected      |

## The Mental Model

AI does not control the DOM. AI controls the product through typed actions. The assistant navigates views, fills forms, applies filters, and prepares replies by dispatching the same state actions used by the normal interface. Gmail integration is isolated in a service, while the assistant layer decides which typed action happens next.
