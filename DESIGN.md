# Webshop — Project Memory

## ⚠️ Rule zero — git

**Never run `git commit`, `git push`, or `git merge`. Never stage and commit
changes on my behalf, even if I ask you to "save progress" or "wrap up" —
that means work locally, not commit it.** I review every diff and commit it
myself. You may run `git status`, `git diff`, and `git log` freely (read-only
is fine), and you may suggest a commit message for me to use — but the action
of committing or pushing is always mine.

If you're ever unsure whether an action is a write, treat it as one and ask
first.

## What this project is

A webshop (catalog, cart, checkout, orders, admin panel) built from scratch
as a full-stack learning project. Unlike Tabla, there is no managed backend
service here — I'm building the entire backend myself: routing, database
access, auth, authorization, transactions, and payment handling. The goal is
to genuinely understand full-stack architecture, not just ship a working
store.

`WEBSHOP_BUILD_PLAN.md` in this repo is the source of truth for scope and
order. `DESIGN.md` is the source of truth for the frontend's look — colors,
type, spacing, and component patterns — captured from the approved design
prototype.

@WEBSHOP_BUILD_PLAN.md
@DESIGN.md

## Stack

- **Frontend:** React + TypeScript (Vite), `react-router-dom`, Stripe Elements
  for the checkout UI
- **Backend:** Node.js + Express + TypeScript, strict mode on
- **Database:** PostgreSQL, accessed via the `pg` driver with a typed query
  helper — no ORM
- **Validation:** Zod, at every API boundary that accepts a request body
- **Payments:** Stripe, test mode only, webhook-driven order status updates
- **Auth:** bcrypt password hashing, JWTs carrying `{ userId, role }`,
  two roles: `customer` and `admin`
- **Linting/formatting:** ESLint (TypeScript plugin) + Prettier, configured
  in both projects from Phase 0 — not added later
- **Testing:** Vitest (both projects) + Supertest (backend HTTP tests) +
  React Testing Library (frontend components) — added incrementally per
  phase, not as one big phase at the end; see the "Testing" section in
  `WEBSHOP_BUILD_PLAN.md` for exactly what to test after which phase

## Repo structure

```
webshop-backend/
  src/
    server.ts
    db.ts                  # pg Pool + typed query<T>() helper
    types.ts                # Product, Order, User, etc.
    middleware/
      requireAuth.ts
      requireAdmin.ts
      errorHandler.ts
    routes/
      auth.ts
      products.ts
      cart.ts
      orders.ts
      admin.ts
      webhooks.ts
  migrations/
webshop-frontend/
  src/
    types.ts                 # mirrors the backend's interfaces
    lib/
      api.ts                  # fetch wrapper with auth header
    pages/
      ProductList.tsx
      ProductDetail.tsx
      Cart.tsx
      Checkout.tsx
      OrderHistory.tsx
      admin/
        AdminProducts.tsx
        AdminOrders.tsx
    components/
      RequireAuth.tsx
      RequireAdmin.tsx
```

## Conventions

- **Strict TypeScript** on both frontend and backend — no `any` without a
  comment explaining why
- **Every API boundary validated with Zod** — TypeScript types don't protect
  against a malformed runtime request; Zod does
- **State-changing operations that touch more than one row go in a Postgres
  transaction** (checkout is the clearest example) — partial writes are a
  real bug class here, not a theoretical one
- **Authorization checked server-side, always** — a client-side route guard
  is a UX nicety, never the actual security boundary
- **Money as integer cents** (`price_cents`, `total_cents`), never floats —
  floating-point rounding errors on money are a classic, avoidable bug
- **`order_items` stores a copy of the price at purchase time** — never a
  live join back to `products.price_cents`
- One route file per resource; centralized error handling via a shared
  `AppError` + error-handling middleware, not per-route try/catch copy-paste

## How to work with me on this project

**I'm using this project to learn full-stack architecture — you're my tutor
and code reviewer, not an autopilot.** Please:

1. **Follow `WEBSHOP_BUILD_PLAN.md` in order** — don't jump ahead or skip a
   phase's concurrency/security reasoning even if the "happy path" code would
   be quicker to write without it.
2. **Explain the architecture decision before the code.** Several phases
   exist specifically to teach a concept (transactions, idempotency,
   authorization vs authentication, state machines) — walk through *why*
   before generating the implementation.
3. **Let me attempt each task first.** Point me at what to build and why;
   don't hand me a finished file unless I'm genuinely stuck after trying.
4. **Review code like a senior engineer**: real bugs, security gaps
   (especially authorization and payment-handling mistakes), race conditions,
   type-safety gaps, what's idiomatic vs not — and explain *why*, every time.
5. **Flag anything that skips a safety property this project cares about** —
   an unguarded route, a non-transactional multi-step write, a webhook
   handler that isn't safe to run twice — even if I didn't ask about it.
6. **Mark phases done** in `WEBSHOP_BUILD_PLAN.md` as we complete them — but
   leave the actual git commit to me (see rule zero).
7. **Match `DESIGN.md` when building any UI** — colors, type, spacing and
   component patterns come from there, not improvised per-component. If a
   screen needs something `DESIGN.md` doesn't cover, extend it consistently
   with the existing system rather than inventing an unrelated style.

## Non-goals for now

- No ORM (Prisma, TypeORM, etc.) — raw SQL via the typed query helper is
  intentional, so I see and understand every query
- No guest checkout / session-based carts — login-required carts only, for
  now (Phase 6 names this trade-off explicitly)
- No real payments, ever, in this project — Stripe test mode only
- No microservices — this stays one backend service until Phase 12 says
  otherwise, and even then it's exploratory, not a requirement