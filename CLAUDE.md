# Staple — Design Reference

Visual reference: [Staple — Webshop Design canvas](https://claude.ai/artifact/EvmSq6oDYjctTpKwCQuxKA)
(open it and click through Home → Product → Cart → Checkout → Order Confirmation — it's a working prototype, not static images)

This is the single chosen direction (the "v2 — Meridian" row in that canvas was an alternative
that was **not** picked — ignore it when building).

## Brand

Name: **Staple** (wordmark: `STAPLE`, set in Newsreader, letter-spacing 0.5px)
Feel: general store / catalog — honest materials, unpretentious, built to last. Not a generic SaaS look.

## Color tokens

| Token | Hex | Used for |
| --- | --- | --- |
| `--bg` | `#F5F2EA` | Page background (warm parchment) |
| `--ink` | `#201E1B` | Primary text, dark surfaces (hero, footer button) |
| `--muted` | `#6B655C` | Secondary text, prices, captions |
| `--muted-2` | `#A39C8D` | Tertiary text, struck-through prices, disabled |
| `--line` | `#E4DFD3` | Borders, dividers |
| `--card-bg` | `#FFFFFF` | Cards (order summary, order confirmation) |
| `--accent` | `#C8872E` | Primary CTA fill (ochre) — buttons, cart badge |
| `--accent-alt-1` | `#B5533C` | Sale tag (rust) |
| `--accent-alt-2` | `#4B6357` | "New" tag, confirmation checkmark (sage green) |

The accent is a **user-selectable prop** in the design file (color tweak), defaulting to
`#C8872E`. If you want to offer a theme switcher later, these three accent values are the
intended options — don't invent new accent hues without a reason.

## Typography

- **Display / headings:** `Newsreader` (serif). Google Fonts: `family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700`
- **UI / body:** `IBM Plex Sans`. Google Fonts: `family=IBM+Plex+Sans:wght@400;500;600;700`
- Explicitly **not** Inter, Roboto, or Arial — those read as generic/default and were avoided on purpose.

| Role | Font | Size | Weight |
| --- | --- | --- | --- |
| Hero H1 | Newsreader | 52px | 600 |
| Page H1 (Cart, Checkout) | Newsreader | 32px | 600 |
| Product detail H1 | Newsreader | 36px | 600 |
| Section H2 | Newsreader | 20–22px | 600 |
| Wordmark | Newsreader | 24px | 600 |
| Body / product name | IBM Plex Sans | 15–16px | 600 (names), 400 (body) |
| Caption / price / muted | IBM Plex Sans | 13–14px | 400–500 |
| Micro (tags, labels) | IBM Plex Sans | 11–12px | 600, often uppercase w/ letter-spacing |

## Spacing & shape

- Page outer padding: **56px** (catalog/cart/checkout), **80px** (product detail)
- Section gaps: **32px** typical, **64–72px** between major page sections
- Grid gutter (product grid): **32px**, 4 columns
- Border radius: **4px everywhere** — buttons, cards, image blocks, inputs. Not pill-shaped, not sharp 0px. This is a deliberate "structured, not soft" choice — don't drift toward fully rounded corners.
- Borders: **1px solid `--line`**, used for card outlines, input borders, dividers
- Swatches/avatars (finish selector circles): the one exception to square radius — those are `border-radius: 50%`

## Component patterns

**Buttons**
- Primary: `background: var(--accent); color: var(--ink); border-radius: 4px; font-weight: 600`
- Secondary/dark: `background: var(--ink); color: var(--bg)` (footer signup, hero on dark background)
- Ghost/icon buttons: transparent background, no border, just the icon

**Tags** (product "New" / "Sale" labels)
- Small filled chip: `background: <accent-alt>; color: var(--bg); font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 3px`
- Positioned top-left over the product image

**Pills** (category filters)
- `border: 1px solid var(--line); border-radius: 4px; padding: 9px 20px`
- Selected state: `background: var(--accent)` (filled), unselected: white background

**Cards** (order summary, order confirmation)
- `background: #FFFFFF; border: 1px solid var(--line); border-radius: 4px; padding: 28px`

**Quantity stepper**
- Bordered pill container, `−` / number / `+`, each button 34–40px square, no visible border between them (just the outer container border)

**Inputs**
- `border: 1px solid var(--line); border-radius: 4px; padding: 12px 14px; font-size: 14px`

**Icons**
- Inline stroke SVGs (search, account, cart, lock, checkmark, x/remove) — stroke `currentColor` or explicit ink hex, `stroke-width: 1.8–2.4`. No icon font, no emoji.

## Screen inventory

1. **Home / Catalog** — sticky-style header (wordmark, nav, search/account/cart icons with badge count) → dark hero band with headline + CTA → category filter pills (interactive selection) → 4-column product grid with tags → footer with newsletter signup
2. **Product Detail** — image gallery (main + 4 thumbnails) left, details right: eyebrow category, name, price (+ struck-through original if on sale), description, finish/variant swatches (interactive), quantity stepper + Add to cart, expandable Details/Shipping panels, related products row
3. **Cart** — simplified header (logo + "Continue shopping" link only), line items with live quantity steppers and remove buttons (subtotal recalculates), order summary card with Checkout CTA
4. **Checkout** — minimal header with "Secure checkout" badge, two-column: contact + shipping + payment form fields (left), sticky order summary card with Pay button (right) — "Stripe test mode" label near the card fields
5. **Order Confirmation** — centered layout: success checkmark icon, "Thank you, [name]" headline, order number, condensed order summary card, delivery estimate, Continue shopping CTA back to Home

Build these in this order — it matches Phase 9 of `WEBSHOP_BUILD_PLAN.md`, plus the Order Confirmation screen as an addition worth adding to that phase's task list.

## Explicitly avoided (don't reintroduce these)

- Gradient washes, left-border cards, emoji as icons
- Inter / Roboto / Arial
- Fully rounded ("pill") buttons or fully sharp (0px) corners — stick to 4px
- Clickable `<div>`s — every interactive element is a real `<button>` or `<a href>`