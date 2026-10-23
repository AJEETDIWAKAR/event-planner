# Celebration Event Planner

GenAI-powered planning assistant for **weddings, birthdays and community events**. Enter event details and get personalized ideas, a budget split with live spend tracking, a milestone timeline and a vendor checklist.

## Features

- **Personalized ideas** from Google Gemini (server-side), with a deterministic offline fallback so the app always works.
- **Budget tracker**: category split that always sums to 100% and the exact total, spent-vs-allocated, over-budget warnings.
- **Timeline**: milestones with completion checkboxes and progress.
- **Vendor checklist**: Pending / Booked / Paid status, custom vendors, progress.
- Plans are saved locally in the browser (no account, no server storage).

## Architecture

| Path                                          | Role                                                           |
| --------------------------------------------- | -------------------------------------------------------------- |
| `index.html`, `css/`, `js/app.js`             | Accessible UI (DOM APIs only, no `innerHTML`)                  |
| `js/security.js`                              | Input sanitization, validation, AI output schema validation    |
| `js/budget.js`, `timeline.js`, `checklist.js` | Pure, unit-tested domain logic                                 |
| `js/ai-service.js`                            | Calls the API with timeout; validates output; offline fallback |
| `js/rate-limit.js`                            | In-memory rate limiter                                         |
| `api/generate-plan.js`                        | Vercel function: Gemini call, cache, rate limit, validation    |

## Security

- `GEMINI_API_KEY` lives only on the server; never shipped to the browser.
- Strict CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (`vercel.json`).
- All inputs sanitized and range-checked client and server side; payload size cap; per-IP rate limit.
- Prompt-injection hardening: user data is JSON-encoded and labelled untrusted; model output is schema-validated and re-sanitized before rendering.

## Efficiency

Zero runtime dependencies, 10-minute response cache for identical requests, upstream and client timeouts, bounded in-memory structures.

## Known Limitations & Distributed Scaling

- **Per-instance memory in serverless**: In serverless environments like Vercel, memory is not shared across isolated function instances or cold starts. The default in-memory cache and rate limiter protect each instance independently, but an attacker distributing traffic across many concurrent lambda containers could bypass a local limit.
- **Pluggable Shared Store Interface**: To scale to a distributed shared cache and rate limiter, `api/generate-plan.js` exposes clean `CacheStore` and `RateLimiter` interfaces:
  ```javascript
  import { createHandler, createUpstashStores } from './api/generate-plan.js';

  // Plug in Upstash Redis or any Redis-compatible store (zero dependencies using fetch):
  const { cacheStore, rateLimiter } = createUpstashStores({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  export default createHandler({ cacheStore, rateLimiter });
  ```
- **Gemini API & Serverless execution**: Upstream Gemini requests are subject to network latency and are bounded by an explicit 15-second timeout (`AbortSignal.timeout(15000)`). If the external AI service times out, rate limits, or is unconfigured, the app falls back immediately and deterministically to the built-in template engine with zero user disruption.

## Accessibility

Semantic landmarks, skip link, labelled controls, `aria-live` status regions, focus moved to errors, visible focus rings, `<progress>` instead of styled divs, keyboard-only operable, dark mode and `prefers-reduced-motion` support.

## Run locally

```bash
npm test               # unit tests (node:test)
npm run test:coverage  # with coverage
npm start              # http://localhost:3000
node --env-file=.env server.mjs   # with Gemini key
npm install && npm run lint
```

Windows PowerShell blocking `npm`? Use `npm.cmd` or `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Deploy (Vercel)

Import the repo in Vercel, add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`, default `gemini-2.5-flash`), deploy.

## License

MIT
