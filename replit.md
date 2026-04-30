# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- **CLI Portfolio** (`artifacts/cli-portfolio`, web, `/`) — terminal-style personal portfolio for Laksh Singh Kushwah (CS '26). Talks to the API server for messaging and auth.
- **API Server** (`artifacts/api-server`, api, `/api`) — Express 5 + Drizzle. Hosts auth (Replit OIDC), the `/messages` endpoints, and health.
- **Canvas / Mockup Sandbox** (`artifacts/mockup-sandbox`, `/__mockup`) — design preview surface.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (Replit-managed)
- **Auth**: Replit OIDC via `openid-client` v6 (sessions in Postgres, cookie `sid`)
- **Email**: Nodemailer over Gmail SMTP (uses `GMAIL_APP_PASSWORD` secret to send to `laksh.sk108@gmail.com`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React 18 + Vite + Tailwind + wouter + JetBrains Mono

## Features

### CLI Portfolio commands

`help`, `whoami`, `ls -skills`, `roadmap`, `projects`, `philosophy`, `contact`, `date`, `echo`, `pwd`, `clear` plus:

- `message` — multi-step prompt (name → email → body → confirm) that POSTs to `/api/messages`. Always stored in Postgres; also emailed to the owner if SMTP is configured.
- `login` / `logout` — full-page redirect to Replit OIDC.
- `inbox` — owner-only; GETs `/api/messages` and renders all received messages.

### Backend routes

- `GET /api/healthz`
- `GET /api/auth/user`, `GET /api/login`, `GET /api/callback`, `GET /api/logout` (+ mobile token-exchange routes)
- `POST /api/messages` (public, rate-limited by Zod input validation, persists then sends email)
- `GET /api/messages` (auth required, only returns to the email matching `OWNER_EMAIL`)

### DB tables

- `sessions` (Replit Auth)
- `users` (Replit Auth)
- `messages` — id, name, email, body, delivered, created_at

## Secrets

- `SESSION_SECRET` — required by the auth lib
- `DATABASE_URL` etc. — managed by Replit
- `GMAIL_APP_PASSWORD` — 16-char Gmail App Password (needs 2FA on the Gmail account). If absent or invalid, messages are still stored; only the email send is skipped.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
