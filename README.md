# Endpoints

A lightweight, local-first HTTP API client for developers.

**https://endpoints.ir**

Open the app and send a request immediately — no account, no database, no cloud sync required.

## Features (V1)

- Request builder (method, URL, params, auth, headers, body)
- Response viewer (JSON tree, text, HTML, images, binary + large-response protection)
- Secure server proxy with SSRF protection, rate limits, timeouts, and redirect validation
- Collections, history, and environments with `{{variables}}`
- cURL import / cURL & JSON export
- Command palette (`Ctrl/Cmd+K`) and keyboard shortcuts
- Dark / light / system themes
- IndexedDB persistence — data stays on the device

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Vitest (security & parser unit tests)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
npm start
```

## Deploy

Deploy as a standard Next.js app (Node.js runtime required for `/api/proxy`).

Environment: no secrets required for V1. The proxy does not store user data.

Health check: `GET /api/health`

## Security notes

The proxy blocks private networks, localhost, link-local addresses, and cloud metadata endpoints, validates DNS resolution (anti-rebinding), and re-checks redirect targets. Rate limits and size limits apply.

## Phase 2 (not in V1)

- OpenAPI import
- Assertion / test runner
- Multi-language code generation
