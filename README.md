# DevEvent

DevEvent is a Next.js event discovery and review platform for developer-focused events.

## Main Concept

The app separates event ingestion from public publishing. Telegram posts are stored and reviewed before they become public event pages, which keeps the discovery experience clean while still allowing fast collection from channels.

## Core Flow

1. Telegram worker stores every accepted post in `raw_posts`.
2. Keyword-matched and strictly formatted posts become `pending_events`.
3. Admins review pending events at `/admin/pending`.
4. Approved records are published to `events`.
5. Rejected records stay out of the public event feed.

## App Features

- Public event discovery pages
- Event detail pages by slug
- Event creation UI
- Admin pending-event review
- Approve and reject endpoints
- Booking/admin panel components
- Authentication-aware navigation components
- MongoDB-backed event workflow

## Tech Stack

- Next.js App Router
- TypeScript
- React
- MongoDB
- Tailwind CSS
- Clerk/Auth-related UI components

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important Routes

- `/events` - public event list
- `/events/[slug]` - event detail
- `/create` - create event page
- `/admin/pending` - review queue
- `/api/admin/pending/:id/approve` - approve pending event
- `/api/admin/pending/:id/reject` - reject pending event

## Related Repo

`devevent-tg` contains the Telegram ingestion worker that feeds the pending review workflow.
