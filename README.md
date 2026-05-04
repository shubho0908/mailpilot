# MailPilot

Gmail client with an AI assistant that controls the UI through natural language. The assistant can compose emails, filter your inbox, open threads, and execute actions — not just answer questions.

## Demo


https://github.com/user-attachments/assets/80bf62e0-2286-41c8-ad21-b8b7135a6767



## Quick Start

```bash
cp .env.example .env
# Edit .env with your credentials
bun install
docker compose up -d postgres
bun run db:migrate
bun run dev
```

You'll need Google OAuth (Gmail API), an OpenAI API key, and PostgreSQL. For OAuth setup, create OAuth 2.0 credentials in Google Cloud Console, add the redirect URI `{domain}/api/auth/callback/google`, enable Gmail API, and copy the credentials to `.env`.

## Architecture

This is a modular monolith — a single Next.js app with clean domain boundaries. The key layers are:

- `/lib/assistant` - OpenAI → structured commands → UI actions
- `/services/gmail` - OAuth2, MIME, watch/sync
- `/lib/store` - Zustand for mail/assistant/sync state
- `/components/mail` - UI, no business logic

The core idea: AI controls the product through typed actions, not the DOM. The assistant emits structured UI actions that drive the same state layer used by normal user interactions.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the detailed engineering decisions and trade-offs.

## Tech Stack

Next.js 16.2.4 (App Router), TypeScript, Zustand, Drizzle ORM + PostgreSQL, Better-auth, Gmail API, OpenAI SDK (structured output), Tailwind CSS + shadcn/ui, Bun.

## Features

- Gmail OAuth authentication with offline token refresh
- Inbox and Sent views with real email data
- Email detail view with HTML rendering
- Compose, reply, and forward functionality
- Email search and filtering (date range, sender, keyword, unread status)
- AI assistant panel with natural language interface
- Context-aware assistant (knows current view, open email, filters)
- Assistant can compose emails, filter inbox, open specific emails, reply, forward, delete
- Typed action system for AI → UI communication
- Real-time sync via Gmail Watch API (Pub/Sub) with polling fallback
- Dark mode support
- Structured logging with Pino
- Type-safe database operations with Drizzle
- Zustand state management with devtools

The assistant can filter emails, open specific messages, compose drafts, reply to open emails, forward messages, delete emails, answer questions, navigate views, and clear filters. It's context-aware — it knows the current view, open email, active filters, visible list, previous results, date, and timezone.

Examples:

- "Send an email to john@example.com with subject 'Meeting Tomorrow' and body 'Let's meet at 3pm'" → Opens compose, fills fields
- "Show me emails from the last 10 days" → Sets date filter, fetches emails
- "Find the email from Sarah about the project update" → Searches, displays results
- "Open the latest email from David" → Opens most recent from David
- "Reply to this" → Opens compose with reply draft pre-filled
- "Show only unread emails from this week" → Sets unread filter and date range

## Real-Time Sync

Uses Gmail Watch API with Pub/Sub for push notifications, history API for change detection, and SSE for browser updates. Falls back to 20-second polling if Pub/Sub isn't configured.

## Development

```bash
bun run dev              # Start dev server
bun run typecheck        # Type checking
bun run lint             # Linting
bun run format           # Format code
bun run db:studio        # Database studio
bun run db:migrate       # Run migrations
```
