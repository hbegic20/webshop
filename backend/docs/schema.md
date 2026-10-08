# Database Schema

PostgreSQL schema for the Staple webshop. This is the design; the real SQL lives in migrations (Phase 2, Day 8).

## Relationships

```
users 1──1 carts  1──* cart_items  *──1 products
users 1──* orders 1──* order_items *──1 products
           orders 1──* payments
```

- A user has **one** cart (created on first "add to cart").
- A user can have **many** orders.
- Carts and orders each hold many items; each item points to one product.
- An order can have several payment attempts (e.g. first card declined, second succeeds).

## users

People who can log in: customers and admins.

| Column        | Type        | Rules                                                              | Why                                          |
| ------------- | ----------- | ------------------------------------------------------------------ | -------------------------------------------- |
| id            | SERIAL      | PRIMARY KEY                                                        | Unique id for each user                      |
| email         | TEXT        | NOT NULL, UNIQUE                                                   | Used to log in; two accounts can't share one |
| password_hash | TEXT        | NOT NULL                                                           | Hashed with bcrypt, never the real password  |
| role          | TEXT        | NOT NULL, DEFAULT 'customer', CHECK (role IN ('customer','admin')) | Decides what the user may do                 |
| created_at    | TIMESTAMPTZ | NOT NULL, DEFAULT now()                                            | When the account was made                    |

## products

Items for sale in the catalog.

| Column      | Type        | Rules                              | Why                                                                      |
| ----------- | ----------- | ---------------------------------- | ------------------------------------------------------------------------ |
| id          | SERIAL      | PRIMARY KEY                        | Unique id                                                                |
| name        | TEXT        | NOT NULL                           | Shown in catalog and orders                                              |
| description | TEXT        | NOT NULL, DEFAULT ''               | Product detail text; empty string instead of NULL keeps code simple      |
| price_cents | INTEGER     | NOT NULL, CHECK (price_cents >= 0) | Price in cents (999 = €9.99); can't be negative                          |
| stock       | INTEGER     | NOT NULL, CHECK (stock >= 0)       | Units available; the database itself refuses to go below 0               |
| image_url   | TEXT        | (nullable)                         | A product can exist before it has a photo                                |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT now()            | When the product was added                                               |
| deleted_at  | TIMESTAMPTZ | (nullable)                         | NULL = active; a date = soft-deleted (hidden, but old orders still work) |

## carts

One open cart per user.

| Column     | Type        | Rules                                  | Why                                   |
| ---------- | ----------- | -------------------------------------- | ------------------------------------- |
| id         | SERIAL      | PRIMARY KEY                            | Unique id                             |
| user_id    | INTEGER     | NOT NULL, UNIQUE, REFERENCES users(id) | Owner; UNIQUE = max one cart per user |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()                | When the cart was created             |

## cart_items

Products currently in a cart.

| Column     | Type    | Rules                                            | Why                                                  |
| ---------- | ------- | ------------------------------------------------ | ---------------------------------------------------- |
| id         | SERIAL  | PRIMARY KEY                                      | Unique id                                            |
| cart_id    | INTEGER | NOT NULL, REFERENCES carts(id) ON DELETE CASCADE | Which cart; if the cart is deleted, its items go too |
| product_id | INTEGER | NOT NULL, REFERENCES products(id)                | Which product                                        |
| quantity   | INTEGER | NOT NULL, CHECK (quantity > 0)                   | Can't have 0 or negative items                       |

Table rule: `UNIQUE (cart_id, product_id)` — the same product appears only once per cart. Adding it again increases `quantity` instead of creating a second row.

## orders

A completed checkout.

| Column      | Type        | Rules                                                                                   | Why                                                                     |
| ----------- | ----------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| id          | SERIAL      | PRIMARY KEY                                                                             | Order number                                                            |
| user_id     | INTEGER     | NOT NULL, REFERENCES users(id)                                                          | Who placed the order                                                    |
| status      | TEXT        | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending','paid','shipped','cancelled')) | Only these four states can exist (transitions guarded in code, Phase 7) |
| total_cents | INTEGER     | NOT NULL, CHECK (total_cents >= 0)                                                      | Total at checkout time; stored so it never changes later                |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT now()                                                                 | When the order was placed                                               |

## order_items

The products inside one order.

| Column           | Type    | Rules                                   | Why                                                                                      |
| ---------------- | ------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| id               | SERIAL  | PRIMARY KEY                             | Unique id                                                                                |
| order_id         | INTEGER | NOT NULL, REFERENCES orders(id)         | Which order this line belongs to                                                         |
| product_id       | INTEGER | NOT NULL, REFERENCES products(id)       | Which product was bought                                                                 |
| quantity         | INTEGER | NOT NULL, CHECK (quantity > 0)          | Can't buy 0 or negative items                                                            |
| unit_price_cents | INTEGER | NOT NULL, CHECK (unit_price_cents >= 0) | Price AT PURCHASE TIME — a copy, so old orders stay correct if the product price changes |

## payments

Stripe payment attempts for an order.

| Column                   | Type        | Rules                                                                           | Why                                               |
| ------------------------ | ----------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| id                       | SERIAL      | PRIMARY KEY                                                                     | Unique id                                         |
| order_id                 | INTEGER     | NOT NULL, REFERENCES orders(id)                                                 | Which order is being paid                         |
| stripe_payment_intent_id | TEXT        | NOT NULL, UNIQUE                                                                | Stripe's id; the webhook uses it to find this row |
| status                   | TEXT        | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending','succeeded','failed')) | Result of this payment attempt                    |
| amount_cents             | INTEGER     | NOT NULL, CHECK (amount_cents >= 0)                                             | Amount sent to Stripe                             |
| created_at               | TIMESTAMPTZ | NOT NULL, DEFAULT now()                                                         | When the attempt started                          |

## Design decisions

**1. Why `price_cents` (integer) instead of `price` like `9.99`?**
Decimal numbers in JavaScript (and floats in general) are not exact: `0.1 + 0.2` gives `0.30000000000000004`. With money, those tiny errors add up. Whole cents (`999`) are always exact. Convert to `€9.99` only when displaying.

**2. Why does `order_items` copy `unit_price_cents`?**
Prices change. If an order only pointed to `products.price_cents`, raising a price next month would silently change what old orders say the customer paid. The copy freezes the price at the moment of purchase.

**3. Why `deleted_at` instead of really deleting a product?**
Old `order_items` rows point to the product. A real `DELETE` would either fail (foreign key) or break order history. With `deleted_at`, the product is hidden from the catalog but old orders still show it correctly.

**4. Which columns are `UNIQUE`, and why?**

- `users.email` — one account per email; login would be ambiguous otherwise.
- `carts.user_id` — max one cart per user.
- `cart_items (cart_id, product_id)` — a product appears once per cart.
- `payments.stripe_payment_intent_id` — one row per Stripe payment, so a repeated webhook can't create duplicates.

**5. Which values are allowed in `orders.status`?**
`pending`, `paid`, `shipped`, `cancelled` — enforced by a `CHECK` constraint, so the database rejects anything else (e.g. a typo like `'payed'`). Which _transitions_ are allowed (e.g. `pending → paid` but never `shipped → pending`) is enforced in code by `canTransition()` in Phase 7, because a `CHECK` can only look at one row's current value, not its previous one.
