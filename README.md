# Endpoints

A lightweight, local-first HTTP API client for developers.

**https://endpoints.ir**

Open the app and send a request immediately — no account, no database, no cloud sync required.

## Features

- Request builder (method, URL, params, auth, headers, body, tests)
- Multi-tab editor with collections, folders, history, and environments (`{{variables}}`)
- Response viewer (Pretty/Raw, headers, cookies, HTML/images/binary + large-response protection)
- JSON → TypeScript types from responses
- Secure server proxy with SSRF protection, rate limits, timeouts, and redirect validation
- Import: cURL, OpenAPI 3.x, Postman v2.1, Endpoints backup
- Export: cURL, Postman, Endpoints backup; codegen (fetch / Axios / Go / Python)
- Dark / light themes and workspace reset (local wipe)
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

Environment: no secrets required. The proxy does not store user data.

Health check: `GET /api/health`

## Security notes

The proxy blocks private networks, localhost, link-local addresses, and cloud metadata endpoints, validates DNS resolution (anti-rebinding), and re-checks redirect targets. Rate limits and size limits apply.
