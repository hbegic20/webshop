# Webshop Build Plan — Full-Stack Architecture, Built by You

## Overview

**Stack:** React + TypeScript frontend, Node.js + Express + TypeScript backend, PostgreSQL, Stripe (test mode) for payments. Frontend and backend are two separate projects from day one — no retrofitting this time.

**Scope for this MVP:**

- Product catalog (browse, view detail)
- Cart, tied to a logged-in user
- Checkout with a simulated Stripe payment
- Order history and order status
- Two roles: customer and admin, with admin-only product/order management

**Why this project teaches more than Tabla did:** a webshop has *state that must stay correct under pressure* — stock can't go negative, a payment can't be double-charged, an order's status can't jump from "pending" straight to "shipped". These are real architecture problems, not just CRUD. That's the point.

**Approach:** phases in order, no skipping. Each phase should be genuinely working — not just written — before the next begins.

## Phase 0 — Project setup

**Day 1 — Two projects, one repo (or two)**

- Create `webshop-backend/` and `webshop-frontend/` as separate folders, each its own `package.json`. Either one git repo with both as subfolders, or two repos — your call, but keep the backend genuinely independent of the frontend (no shared `node_modules`, no importing frontend code into it).
- **Why:** this is the real client/server boundary — two things that only ever talk over HTTP, never by direct code import. Tabla blurred this by starting as one file; this project won't.

**Day 2 — Backend TypeScript setup**

- In `webshop-backend`: `npm init -y`, install `typescript`, `@types/node`, `ts-node-dev` (or `tsx`) for auto-reload, and `express` + `@types/express`. Add a `tsconfig.json` (start from `tsc --init`, enable `strict: true`).
- **Why:** `strict: true` is what makes TypeScript actually catch bugs instead of just being JavaScript with extra syntax — worth having on from day one, not bolted on later.

**Day 2.5 — Linting & formatting, both projects**

- In each project (`webshop-backend`, `webshop-frontend`): install `eslint` with the TypeScript plugin (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`) and `prettier`, with a shared `.eslintrc` and `.prettierrc` per project.
- **Why now, not later:** a linter catches real bugs (unused variables, unreachable code, unsafe comparisons) as you write each file, not weeks later in a code review. Setting it up before real code exists means every file you write from here on is checked from day one — retrofitting it onto dozens of existing files later is far more painful and usually gets skipped.

**Day 3 — Frontend scaffold**

- `npm create vite@latest webshop-frontend -- --template react-ts`, confirm `npm run dev` works.
- **Why:** same pattern as Tabla's Phase 0 — get a working shell before writing any real feature code.

## Phase 1 — Backend fundamentals (Express + TypeScript)

**Day 4 — Typed hello-world server**

- Write `src/server.ts`: an Express app with one route, `GET /health` returning `{ status: 'ok' }`. Type the request/response handlers explicitly (`Request`, `Response` from `express`). Run with `ts-node-dev src/server.ts`.
- **Why:** confirms the TypeScript + Express pipeline actually works before building anything real on top of it.

**Day 5 — Route file structure**

- Create `src/routes/products.ts`, `src/routes/cart.ts`, `src/routes/orders.ts`, `src/routes/auth.ts` — one file per resource, each exporting an Express `Router`, mounted in `server.ts` with `app.use('/api/products', productsRouter)` etc.
- **Why:** this is the same one-file-per-resource discipline from the Tabla backend plan — it scales to a much bigger surface area here (products, cart, orders, auth, admin, webhooks) so the discipline matters more.

**Day 6 — Centralized error handling**

- Write a small `AppError` class (`statusCode`, `message`) and one Express error-handling middleware (4-argument function) that catches thrown `AppError`s and formats a consistent JSON error response. Wrap route handlers so thrown errors reach it (an `asyncHandler` wrapper, or just consistent `try/catch` + `next(err)`).
- **Why:** without this, error handling gets copy-pasted inconsistently into every route. Centralizing it now pays off across dozens of endpoints later.

## Phase 2 — Database design

**Day 7 — Design the schema on paper first**

- Sketch tables and relationships before writing SQL: `users` (id, email, password_hash, role), `products` (id, name, description, price_cents, stock, image_url), `carts` (id, user_id, unique per user), `cart_items` (cart_id, product_id, quantity), `orders` (id, user_id, status, total_cents, created_at), `order_items` (order_id, product_id, quantity, unit_price_cents — a *copy* of the price at purchase time, not a live reference to `products.price_cents`), `payments` (id, order_id, stripe_payment_intent_id, status).
- **Why `order_items` copies the price:** if a product's price changes next month, past orders must still show what was actually paid — this is a real, easy-to-miss data modeling decision, not a mistake to fix later.

**Day 8 — Write it as migrations**

- Install `node-pg-migrate` (or write plain numbered `.sql` files in `migrations/` if you prefer full manual control). Write one migration creating all tables above, with foreign keys and a `CHECK` constraint on `orders.status` (e.g. `IN ('pending','paid','shipped','cancelled')`).
- **Why:** migrations make your schema reproducible and reviewable — the same reason Tabla's `CLAUDE.md` insisted on them, doubly important here since this schema is more complex.

**Day 9 — Seed data**

- Write a small script inserting 10–15 fake products (varied prices/stock) and one admin user (role = 'admin') so you have something to browse and test against immediately.

## Phase 3 — Connecting Express to Postgres, with types

**Day 10 — Typed query helper**

- Install `pg` + `@types/pg`. Write a small `db.ts` exporting a `Pool` and a generic helper: `async function query<T>(sql: string, params: unknown[]): Promise<T[]>`. Define a TypeScript interface per table (`Product`, `Order`, etc.) in `src/types.ts`.
- **Why:** this gives you real compile-time typing on query results without an ORM — you still write and see the actual SQL, but TypeScript catches it if you later misspell a field you destructure from the result.

**Day 11 — First real endpoints: the product catalog**

- `GET /api/products` (list, only non-deleted/in-stock optionally), `GET /api/products/:id` (404 if missing). Use the typed `query<Product>()` helper.
- **Why:** the simplest possible real endpoint — good place to confirm the whole chain (route → query helper → Postgres → typed result → JSON) works before adding complexity.

**Day 12 — Runtime validation with Zod**

- Install `zod`. Define a schema for each request body you'll accept (starting with none yet, but set up the pattern: `const CreateProductSchema = z.object({...})`, then `CreateProductSchema.parse(req.body)` inside a route, throwing your `AppError` on failure).
- **Why this matters even with TypeScript:** TypeScript types are erased at runtime — they don't protect you from a malformed request body sent by an actual client. Zod (or similar) is what actually validates data *at the boundary* where your types can't. This is a genuinely important lesson most new TypeScript backend developers learn the hard way.

## Phase 4 — Auth & role-based authorization

**Day 13 — Signup/login (same pattern as Tabla)**

- `POST /api/auth/signup` (bcrypt-hash password, insert into `users` with `role = 'customer'` by default), `POST /api/auth/login` (verify with `bcrypt.compare`, issue a JWT containing `{ userId, role }`).

**Day 14 — `requireAuth` and `requireAdmin` middleware**

- `requireAuth`: verifies the JWT, attaches `req.user = { id, role }`.
- `requireAdmin`: runs after `requireAuth`, returns 403 if `req.user.role !== 'admin'`.
- **Why this is new territory beyond Tabla:** Tabla only ever needed "is this a valid logged-in user." This is **authorization**, not just authentication — deciding *what* a valid user is allowed to do, which is a genuinely different concern that most learning projects skip.

**Day 15 — Apply the right guard to the right routes**

- Public: `GET /api/products*`. Auth-required: everything under `/api/cart`, `/api/orders`. Admin-only: product create/update/delete, order status updates (Phase 5).

**Day 16 — Test all three tiers**

- With your REST client: confirm a public route works with no token, an auth-required route correctly 401s without one, and an admin-only route correctly 403s for a logged-in *customer* token (not just a missing one) — that third case is the one people forget to test.

## Phase 5 — Admin product management

**Day 17 — Admin CRUD endpoints**

- `POST /api/admin/products` (create), `PUT /api/admin/products/:id` (update), `DELETE /api/admin/products/:id` (soft-delete with a `deleted_at` column, not a hard delete — orders referencing a deleted product still need to display correctly). All behind `requireAuth` + `requireAdmin`.

**Day 18 — Stock adjustment as its own action**

- `PATCH /api/admin/products/:id/stock` with `{ delta: number }` rather than overwriting `stock` directly.
- **Why:** an explicit delta (+5, -2) is safer than "set stock to 47" when it's possible two admins (or an admin and a concurrent order) touch stock around the same time — a small preview of the concurrency thinking Phase 6 goes deeper on.

## Phase 6 — Cart & checkout logic

**Day 19 — Decide: cart belongs to a user, not a session**

- For this MVP, require login before adding to cart (skip guest carts — a real product decision with trade-offs worth naming: simpler to build, worse for conversion in a real store, and a reasonable thing to revisit later).
- Each user gets exactly one open cart; create it lazily on first "add to cart" if none exists.

**Day 20 — Cart endpoints**

- `GET /api/cart` (cart + items joined with product info), `POST /api/cart/items` (add or increment quantity), `PATCH /api/cart/items/:productId` (set quantity), `DELETE /api/cart/items/:productId`.

**Day 21 — Stock consistency at add-to-cart time**

- Reject adding more of a product than `stock` allows, with a clear error message.
- **Be honest about the limit of this check:** checking stock when adding to cart does *not* fully prevent overselling — two users could both have "5 in stock" in their cart at once if they check at different moments. The real fix is re-checking stock inside the checkout transaction (Phase 7) — this day's check is a UX nicety, not the actual guarantee. Naming that gap out loud is the point of this task.

## Phase 7 — Orders: transactions and state

**Day 22 — Checkout inside a database transaction**

- `POST /api/checkout`: within a single Postgres transaction (`BEGIN`/`COMMIT`/`ROLLBACK`), re-fetch each cart item's product with `SELECT ... FOR UPDATE` (locks the row), verify stock is still sufficient, create the `order` + `order_items` (copying current price into `order_items.unit_price_cents`), decrement `products.stock`, and clear the cart. If any check fails, roll back the whole thing.
- **Why the transaction matters:** without it, "create the order" and "decrement stock" are two separate operations that could partially succeed if something fails in between — a real order with no stock deducted, or stock deducted with no order. A transaction makes it all-or-nothing.
- **Why `SELECT ... FOR UPDATE` matters:** it's the actual fix for the race condition Phase 6 named — it locks the row so a second concurrent checkout can't read the same "stock: 1" before the first one commits.

**Day 23 — Order status as a real state machine**

- Valid transitions only: `pending → paid`, `paid → shipped`, `pending/paid → cancelled`. Write a small function `canTransition(from, to): boolean` and use it everywhere status changes, rather than trusting whoever calls the update endpoint.
- **Why:** this prevents nonsensical states (a `shipped` order going back to `pending`) that are easy to create by accident without this guard, and are the kind of bug that's very hard to track down later.

**Day 24 — Order read endpoints**

- `GET /api/orders` (the logged-in user's own orders only — filter by `user_id` from the JWT, never trust an id in the query string), `GET /api/orders/:id` (404 if it exists but belongs to someone else — don't leak that distinction to a non-owner, non-admin).

## Phase 8 — Payments (Stripe, test mode)

**Day 25 — Stripe test account + PaymentIntent**

- Create a free Stripe account (stays in test mode — no real charges). Install the `stripe` SDK. On checkout, create a `PaymentIntent` for the order's total, passing an **idempotency key** (e.g. a UUID generated once per checkout attempt on the client, sent with the request).
- **Why idempotency keys matter:** if the client's network request times out and retries, Stripe will recognize the same key and return the same PaymentIntent instead of charging twice. This is a real, common production bug class — "the user clicked pay twice" or "the request retried" — and idempotency keys are the standard fix.

**Day 26 — Webhook endpoint**

- `POST /api/webhooks/stripe`: verify the request signature using Stripe's webhook secret (never trust an unverified webhook body), handle `payment_intent.succeeded` by marking the matching order `paid` (via the state-machine function from Phase 7).
- **Why a webhook and not just trusting the frontend:** the frontend confirming "payment succeeded" is not proof — a user could fake that call. The webhook comes directly from Stripe's servers and is the actual source of truth for payment status.

**Day 27 — Handle webhook retries safely**

- Stripe redelivers webhooks it doesn't get a fast 200 response for — your handler must be safe to run twice on the same event (e.g. check the order isn't already `paid` before transitioning it again).
- **Why:** this is "idempotency" again, from a different angle — the same lesson applied to *receiving* events instead of *sending* requests.

## Phase 9 — Frontend (React + TypeScript)

**Day 28 — Shared types + API client**

- In `webshop-frontend/src/types.ts`, mirror the backend's interfaces (`Product`, `Order`, etc.) — kept in sync by hand for now (a monorepo with a shared package is a nice later improvement, not a Phase 9 concern). Write a small `api.ts` wrapping `fetch` with the base URL and auth header attachment.

**Day 29 — Catalog + product detail pages**

- Install `react-router-dom`. `ProductList` page (`GET /api/products`), `ProductDetail` page (`GET /api/products/:id`) with an "add to cart" button.

**Day 30 — Cart page**

- Show cart contents, quantity controls, running total; calls the Phase 6 endpoints.

**Day 31 — Auth pages + protected routes**

- Signup/login forms calling `/api/auth/*`, store the JWT (React state + `localStorage` for persistence across reloads), a simple `<ProtectedRoute>` wrapper redirecting to login when there's no token.

**Day 32 — Checkout flow**

- Install `@stripe/stripe-js` + `@stripe/react-stripe-js`. Use Stripe Elements (test mode) to collect card details client-side (test card: `4242 4242 4242 4242`), confirm the PaymentIntent, then poll or wait for the order to show as `paid` (driven by the webhook from Phase 8, not by the frontend directly setting status).

**Day 33 — Order history page**

- List past orders with status; detail view showing line items.

## Phase 10 — Admin panel

**Day 34 — Admin route guard**

- A `<RequireAdmin>` wrapper reading the decoded JWT's role — but remember this is a UX convenience only. The real enforcement already exists server-side (Phase 4); a client-side check is just to avoid showing admin UI to someone who'll get a 403 anyway, never a substitute for it.

**Day 35 — Admin product management UI**

- List all products (including out-of-stock), create/edit forms, delete (soft-delete) action.

**Day 36 — Admin order management UI**

- List all orders (not just the admin's own — this endpoint needs its own `requireAdmin`-gated backend route, `GET /api/admin/orders`), and a control to move an order's status forward (respecting the Phase 7 state machine).

## Phase 11 — Deployment

**Day 37 — Hosted Postgres**

- A free instance on Railway, Render, or Neon; run your migrations against it.

**Day 38 — Deploy the backend**

- Push `webshop-backend` to GitHub, deploy on Render or Railway. Environment variables in the host's dashboard: database URL, JWT secret, Stripe secret key, Stripe webhook secret — never in code.
- Point Stripe's webhook configuration at the deployed backend's `/api/webhooks/stripe` URL (test mode webhooks work the same as live ones).

**Day 39 — Deploy the frontend**

- Vite build, hosted on Netlify or Vercel, pointed at the deployed backend URL. Stripe's publishable key (safe to expose client-side) goes here; the secret key never does.

**Day 40 — End-to-end smoke test**

- Sign up, browse products, add to cart, check out with Stripe's test card (`4242 4242 4242 4242`, any future expiry, any CVC), confirm the order shows as `paid`, confirm stock decremented, log in as admin and confirm the order appears in the admin panel.

## Testing — built in as you go, not bolted on at the end

Tests aren't a separate phase here on purpose — the riskiest code in this project (the checkout transaction, the order state machine, the webhook handler) is exactly the code covered in Phases 3, 7 and 8, so testing it belongs right there, while it's fresh, not retrofitted after Phase 11.

**Tooling:** Vitest for both projects (fast, works natively with Vite on the frontend, drop-in on the backend too) + Supertest for backend HTTP endpoint tests + React Testing Library for frontend component tests.

**Add these as you reach each phase:**

- **After Phase 3** (Zod validation): unit tests for each schema — valid input passes, missing/malformed fields are rejected with the right error.
- **After Phase 4** (auth/roles): tests for `requireAuth` and `requireAdmin` — a request with no token, an expired token, a valid customer token on an admin route, a valid admin token — covering all four cases, not just the happy path.
- **After Phase 7** (orders): this is the most important testing checkpoint in the whole plan. Unit tests for `canTransition()` (every valid transition passes, every invalid one is rejected) and an integration test for the checkout endpoint itself — including a test that simulates two near-simultaneous checkouts against the same low-stock product, to prove the `SELECT ... FOR UPDATE` locking actually prevents overselling. A concurrency bug that isn't tested tends to stay invisible until it happens in production with a real customer.
- **After Phase 8** (payments): a test that calls the webhook handler twice with the same event, confirming the order only transitions once — this is the direct test of the idempotency behavior that phase built.
- **During Phase 9** (frontend): component tests for the cart's quantity/subtotal logic and the checkout form's validation — not every component needs a test, but anything with real logic (not just markup) does.

**A simple rule for what needs a test:** if a bug in this code would cost you money, leak another user's data, or corrupt an order, it needs a test. If it's purely presentational, it usually doesn't.

## Phase 12 — Where to go next

| Topic | Why it's next | Quick way in |
| --- | --- | --- |
| Docker | Package backend + Postgres so the whole stack runs identically anywhere | `docker-compose.yml` with a Postgres service + your backend |
| CI/CD | Automate tests + deploys | GitHub Actions running lint + your test suite (from the section above) on every push and pull request |
| Caching | The product catalog is a natural cache candidate (read-heavy, changes rarely) | Add Redis in front of `GET /api/products`, invalidate on admin edits |
| Search | "Find products" beyond exact match | Postgres full-text search (`tsvector`) before reaching for Elasticsearch |
| Observability | See what's actually happening in production | Structured logging + an error tracker (Sentry free tier) |
| Microservices | Understand when splitting genuinely helps | Read case studies first — this webshop is small enough that splitting it would likely be premature, and recognizing that is itself the lesson |

By the end of Phase 11 you'll have built — yourself — a role-based auth system, a transactional checkout with real concurrency handling, and a webhook-driven payment flow. Those three things alone cover more real backend architecture than most bootcamp "e-commerce clone" tutorials ever touch, because they were built to work correctly under pressure, not just to look done in a demo.