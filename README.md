# SpazaStock

The starter for the Week 7 revision challenge. Thandeka runs a spaza shop: this app shows her shelves, warns her when stock runs low, and records each sale.

The brief (the rounds, the rules and the timings) is the PDF your instructor hands out. This file covers how to run the project and the API you'll be calling.

## Run it

You need Node 24.

```bash
npm ci
npm run dev
```

Open **http://localhost:3000**. If port 3000 is busy, stop Matric Compass or RondiTrack first.

Checks:

```bash
npm run typecheck
npm run lint
npx vitest run
```

## The API

There is no backend to start. A fake API runs **inside the browser**, using MSW (Mock Service Worker). It catches every request to `/api/v1/*` and answers like a real API would. The base URL is in `.env.development` as `VITE_API_BASE_URL`.

The contract is `openapi.json`, and `src/api/schema.d.ts` was generated from it with `npm run generate:api`. **Read the contract before you code: it is not the same as Matric Compass or RondiTrack.**

| Endpoint | Returns | Notes |
|---|---|---|
| `GET /api/v1/categories` | `Category[]` | Six categories, in shelf order. |
| `GET /api/v1/categories/{id}/products?pageSize=6&pageToken=…` | `{ items: Product[], nextPageToken: string \| null }` | **`null` means no more pages.** One category is empty. A deleted category returns **404**. |
| `POST /api/v1/sales` | `201` with the `Sale` | Body: `{ productId, quantity, unitPriceInCents }`. Optional `Idempotency-Key` header. |
| `GET /api/v1/sales/today` | `{ count, totalInCents }` | |

- All money is integer cents.
- Every error is `application/problem+json`, with a `correlationId`.
- A 400 from `POST /sales` has an `errors` map keyed by the request's field names: `productId`, `quantity`, `unitPriceInCents`.
- The API has two rules the form won't know about until it tries. You'll find them.
- A 409 means there isn't enough stock. Its `detail` says how many are left.

## The chaos panel

The **Chaos** button in the bottom-right corner makes the fake API misbehave, once, so you can see every error state:

- **Next products request:** 500, 429 (with `Retry-After`), no network, or slow (2 seconds).
- **Next sale (POST):** the same four.

Each switch is armed for one request, then turns itself off. **Reloading the page restocks the shop** and clears today's sales.

## What's here

| Path | What it is |
|---|---|
| `openapi.json` | The API contract |
| `src/api/schema.d.ts` | Types generated from it. Don't edit by hand. |
| `src/lib/money.ts` | `formatCents`, from Day 1 |
| `src/data/sample.ts` | Six products, for Round 1 only |
| `src/components/ui/` | shadcn: button, card, badge, input, label, native-select, skeleton, dropdown-menu |
| `src/components/ModeToggle.tsx`, `ThemeProvider.tsx` | Dark mode, from Day 2 |
| `src/mocks/` | The fake API and the chaos panel. You don't need to read or change it. |
| `BUG-HUNT.md` | Your bug-hunt answers |
| `PROGRESS.md` | Fill in before you hand in |

Installed and ready: TanStack Query, openapi-fetch, React Hook Form, Zod and `@hookform/resolvers`, at the same versions as Matric Compass.
