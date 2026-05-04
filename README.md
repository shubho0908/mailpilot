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

## What I'd Improve With More Time

What excites me about this project isn't just the AI assistant — it's the opportunity to reinvent how we interact with email. Here's where I'd take this:

**Email Intelligence**
The assistant should understand your inbox at a deeper level. Summarize threads, extract action items, detect urgency, and suggest smart replies. "Show me emails that need my attention today" becomes possible when the AI actually reads and understands context. This is the natural evolution of the assistant — from executing commands to understanding meaning.

**Semantic Search**
Keyword search is the past. I want to search by meaning: "emails about the Q4 budget" or "messages where someone is waiting on me." The AI would understand the semantic content, not just match strings. This requires embedding emails and doing vector similarity search, but the payoff is huge — you find what you actually want, not just what you typed.

**Email Triage**
Imagine your inbox automatically categorized: urgent, requires action, informational, can wait. The assistant learns your priorities over time and surfaces what matters. No more drowning in notification badges. The technical challenge is building a model that respects individual differences — what's urgent for me might not be urgent for you.

**Multi-Account Harmony**
People have work email, personal email, side projects. A unified inbox where the assistant understands context across accounts — "show me all emails about the project from any account" — would be genuinely useful. The architecture challenge is handling multiple OAuth tokens, sync states, and ensuring the assistant doesn't get confused about which account it's operating on.

The goal isn't more features. It's making email feel less like a chore and more like a tool that actually helps you get work done. The AI assistant is the beginning, not the end.
