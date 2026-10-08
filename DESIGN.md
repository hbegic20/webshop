# DESIGN.md: webshop design spec

This file is the source of truth for all UI in this project. Read it before creating or changing any page, component or style.

## How to use this file

- Use only the tokens in section 2. Do not introduce new colors, fonts, radii, shadows or gradients.
- Build pages from the components in section 3. If a pattern is missing, compose it from existing tokens and the closest component, then say so in your summary so the spec can be updated.
- The spec is stack-neutral. Tokens are given as CSS custom properties; map them once into the project's styling system (theme config, CSS variables, etc.) and reference them from there. Never paste raw hex values into components.
- Product names, prices, categories and delivery options in the mockups are sample data. They come from the data layer, never from hard-coded markup. Text in square brackets (`[Your shop]`, `[Full name]`) is a placeholder for real content.
- Visual reference: the "Webshop app" design canvas, with a "Mobile app" row and a "Desktop web" row, covering Home, Category (with the phone filter panel), Search, Product (with the added-to-bag state), Saved, Bag, Checkout, Order placed, Log in and Account, plus a dark-mode Home on each row. Treat the mobile row as the phone layout of the same responsive site.
- Section 4 (states) was not drawn in the mockups. It is specified here in words; follow it as written.

## 1. Direction

Bold color-block. A cool off-white page, white cards, deep ink text, a cobalt accent and a sun-yellow highlight. Product photos sit on saturated color tiles (mint, tangerine, sun, sky, pink, lilac), so the grid reads as a wall of color. Everything is flat: no shadows, no gradients, no borders on cards. Controls are pill-shaped, cards are generously rounded. Headlines are big, heavy and tightly tracked; everything else stays quiet.

## 2. Tokens

```css
:root {
  /* Color */
  --color-ground: #EEF0F2;        /* page background */
  --color-surface: #FFFFFF;       /* cards, pills, inputs, bars */
  --color-ink: #101318;           /* text, dark buttons, badges */
  --color-muted: #565E69;         /* secondary text, inactive icons */
  --color-line: #D9DDE2;          /* dividers, unselected option borders */
  --color-line-strong: #C9CED5;   /* dividers drawn on the ground color */
  --color-field-border: #8A929C;  /* text input borders */
  --color-accent: #2540D9;        /* primary actions, links, selected state */
  --color-accent-hover: #1A2EA6;
  --color-on-accent: #FFFFFF;
  --color-on-accent-muted: #E1E6FF; /* secondary text on accent */
  --color-highlight: #FFD23F;     /* bag badge, hero badge and arch, promo band; ink text only */
  --color-danger: #B42318;        /* form errors only */

  /* Product tile colors: one per product, cycle in this order.
     Text and icons on these are always ink, never white. */
  --tile-mint: #6FDDB0;
  --tile-tangerine: #FF9A4D;
  --tile-sun: #FFD23F;
  --tile-sky: #7DBDFF;
  --tile-pink: #FFA3C4;
  --tile-lilac: #B9A4FF;

  /* Type */
  --font-display: 'Bricolage Grotesque', system-ui, sans-serif; /* 800 for headlines, 700 elsewhere */
  --font-body: 'Figtree', system-ui, sans-serif;                /* 400 to 700 */

  /* Radius */
  --radius-input: 12px;
  --radius-option: 16px;        /* radio option cards (14px on phone) */
  --radius-tile: 20px;          /* photo tile inside a product card (18px on phone) */
  --radius-product-card: 28px;  /* white product card (24px on phone) */
  --radius-card: 24px;          /* other white cards (20px on phone) */
  --radius-hero: 36px;          /* hero and promo band (28px on phone) */
  --radius-pill: 999px;   /* every button, chip, search field, stepper */

  /* Layout */
  --container: 1200px;
  --gutter: 24px;         /* 20px on phone */
  --touch-min: 44px;
}
```

Dark mode overrides only the neutral tokens. Accent fills, highlight yellow and the tile colors stay exactly the same, and anything sitting on them keeps ink text. Apply it with `prefers-color-scheme: dark` and a manual toggle that sets `data-theme` on the root element.

```css
[data-theme='dark'] {
  --color-ground: #0F1115;
  --color-surface: #1C2028;
  --color-ink: #F3F4F6;           /* page text */
  --color-muted: #A7AEB9;
  --color-line: #2E333D;
  --color-line-strong: #3A404B;
  --color-field-border: #7C8592;
  --color-link: #9DB0FF;          /* accent-colored text and active tab; fills stay #2540D9 */
  --color-link-hover: #C2CEFF;
  --color-button-dark-bg: #F3F4F6; /* dark buttons invert: light fill, ink text */
  --color-button-dark-fg: #101318;
}
```

In light mode `--color-link` is the accent (`#2540D9`), `--color-button-dark-bg` is ink and `--color-button-dark-fg` is white. Controls placed on a color tile (white save button, ink quick-add button, ink badges) do not change in dark mode.

Fonts load from Google Fonts: Bricolage Grotesque (variable, optical size 12 to 96, weights 500 to 800) and Figtree (weights 400 to 700).

### Type scale

| Role | Font | Phone | Desktop |
|---|---|---|---|
| Hero headline | display 800 | 36px / 0.95, -0.03em | clamp(3rem, 8vw, 6.5rem) / 0.9, -0.04em |
| Promo band headline | display 800 | 26px / 1.05, -0.02em | clamp(1.75rem, 3.6vw, 3rem) / 1, -0.03em |
| Category page title (h1) | display 800 | 38px / 1.05, -0.03em | clamp(2.5rem, 6vw, 4rem) / 1, -0.03em |
| Other page titles (h1) | display 700 | 30 to 36px / 1.1, -0.02em | clamp(2.25rem, 5vw, 3rem) / 1.1, -0.02em |
| Product title | display 800 | 30px / 1.05, -0.03em | clamp(2.5rem, 5vw, 3.75rem) / 1, -0.03em |
| Product page price | display 700 | 24px | 2rem |
| Section title (h2) | display 700 | 24px, -0.02em | 32px, -0.02em |
| Card title | display 700 | 22px | 22px |
| Total amount | display 700 | 24px | 28px |
| Body | body 400 | 15px / 1.35 | 16px / 1.4 |
| Product name in a card | body 600 | 15px | 17px |
| Price in a card | display 700, tabular numerals | 19px | 23px |
| Card category label | body 700, uppercase, 0.06em, muted | 11.5px | 12.5px |
| Other prices and amounts | body 600 to 700, tabular numerals | 15px | 16px |
| Button label | body 700 | 16px | 17px |
| Secondary text | body 400, muted | 13.5px | 14.5px |
| Tab bar label | body 600 | 11.5px | n/a |
| Section label (phone checkout) | body 700, uppercase, 0.06em | 12.5px | n/a |

### Spacing and sizing

- Spacing steps: 4, 8, 10, 12, 16, 20, 24, 28, 32, 48, 56, 72px. Lay out with flex or grid and `gap`; avoid one-off margins.
- Phone: 20px side gutters, 28px between page sections, 12px between product cards in both directions.
- Desktop: 1200px container with 24px gutters, 56px between page sections, 20px between product cards in both directions, 72px bottom padding before the footer.
- Minimum touch target 44 x 44px for every interactive element.
- Heights: primary button 56px, secondary button 44 to 52px, search field 48px, text input 48px, chip 44px, icon button 44px.

### Breakpoints

- Below 768px: phone layouts (mobile row). Bottom tab bar is the main navigation.
- 768px and up: desktop layouts (desktop row). Header navigation replaces the tab bar.
- Grids use `repeat(auto-fit, minmax(min(240px, 100%), 1fr))` so column counts fall out of the width: 2 columns on phone (use a fixed 2-column grid there), 3 beside the filter sidebar, 4 full width.
- Two-column pages (category, bag, checkout, order placed) are wrapping flex rows: main column `flex: 999 1 520px`, side column `flex: 1 1 320px` (filters 220px, checkout summary 340px). The side column stacks under the main column when there is no room.

## 3. Components

**Primary button.** Accent background, white text, pill, 56px high, full width of its container on phone. One per screen: Add to bag, Go to checkout, Place order, Keep shopping.

**Dark button.** Ink background, white text, pill, 44 to 48px high. Used for the active chip, the active desktop nav item and the empty-bag action.

**Light button.** White background on the ground color (or ground-colored on a white bar), ink text, pill. Used for chips, Filter, Sort and secondary actions such as View order.

**Text button.** Accent text, weight 700, no background, 44px high hit area. Used for Change, Apply and See all.

**Icon button.** 44px circle, white background, 22px icon. The bag button is the exception: ink background, white icon, and a highlight-yellow count badge with ink text and a 2px ground-colored ring.

**Icons.** Outline icons on a 24px grid, 1.8px stroke, round caps and joins, `currentColor`. Lucide matches the mockups (home, layout-grid, heart, shopping-bag, user, search, chevrons, plus, minus, x, check, lock, sliders-horizontal). No emoji, no filled icons except the saved heart.

**Search field.** White pill, 48px high, search icon in muted color on the left, placeholder "Search products" in muted color.

**Category chip (phone).** 44px pill in a horizontally scrolling row that bleeds to the screen edge. Active chip is dark.

**Product card.** A white card (10px padding, 18px bottom padding; 8px and 14px on phone) holding a color tile with the product photo. Below the tile, inset 8px: the category label, the name (weight 600) and the price in the display font. The card body is one link to the product. Three controls are layered on the tile: a white save (heart) button top right, an ink quick-add button with a white plus icon bottom right (48px on desktop, 44px on phone), and an optional ink badge top left ("New" or "−20%"). Sale items show the old price struck through in muted color after the new price. Tile height is 280px on desktop home, 260px in the category grid, 160px on phone.

**Compact product card.** Used in the phone "Just in" and "Goes well with" rows: 160px wide, 124px tile, name on one line with ellipsis, no quick-add button. These rows scroll horizontally and bleed to the screen edge.

**Product photo tile.** Background is one of the six tile colors, assigned per product. Photos are cut-outs with a transparent background so the color shows through, centered, `object-fit: contain` with about 10% padding. The desktop product gallery is 6:5; the phone product photo is full-bleed and 400px tall. The plain color tile doubles as the loading placeholder. The "Photo" labels in the mockups are placeholders only.

**Quantity stepper.** Pill with minus button, number, plus button. 44px high in lists, 56px beside the Add to bag button. Range 1 to 9.

**Color swatch.** 30px circle inside a 44px button. Selected swatch gets a 2px ink ring with a 3px gap. Show the selected color name as text next to the "Color" label. Choosing a color updates the photo and its tile color. Sample colors in the mockups: Mint, Sun, Cobalt.

**Text input.** Label above (14.5px, weight 600), 48px high field (52px on the log in screens), 1.5px field-border, 12px radius, 16px text. No placeholder text inside fields.

**Size picker.** A row of 44px pills with a 2px border. Selected: ink fill, white text. Available: transparent with a line-strong border. Sold out: muted text with a line through it, disabled, and "sold out" added to its accessible name. The selected size is repeated as text next to the "Size" label. Show it only for products that have sizes.

**Stock line.** A 10px dot and a short text under the price: green dot (`#3FBF8F`) with "In stock", yellow dot (`#F2B705`) with "Only 3 left" when stock is low. The text always carries the meaning. When the selected variant is sold out, disable "Add to bag" and change its label to "Sold out".

**Added-to-bag panel.** Shown after "Add to bag" over a 55% ink scrim. Desktop: a 420px panel sliding in from the right with a mint check circle, "Added to bag", the item (tile, name, variant line, price), the bag subtotal, then "Checkout" (primary), "View bag" (light) and "Keep shopping" (text). Phone: a bottom sheet with 28px top corners holding the same header and item, "View bag" (primary) and "Keep shopping" (light). Clicking the scrim, the close button or "Keep shopping" closes it. Move focus into the panel when it opens and back to the button when it closes.

**Filter panel (phone).** Bottom sheet over the category page with a grab handle, "Filter" title and close button. Groups of toggle pills (ground-colored when off, ink when on) for Type and Price, an "In stock only" checkbox row, and a footer with "Clear all" (text button) and a primary button that shows the live result count ("Show 3 items"). On desktop the same filters live in the sidebar as checkboxes.

**Reviews.** Section title, a row of five star icons (filled to the average) with "[Rating] out of 5 · [number] reviews", a "See all" link, then review cards: stars, bold title, muted text, and a small muted line with name and date. Two cards on phone, three in a grid on desktop. Render the section only when the product has real reviews.

**Express checkout.** Ink pill buttons for wallet payments at the top of checkout (two side by side on phone, up to three in a row on desktop), followed by a divider line with centered muted text. In production, swap these for each payment provider's official button.

**Order card.** "Order [number]" in bold with the date in muted text, a status pill, small color tiles for the items, the total and a link or chevron to the order.

**Status pill.** 26 to 28px pill with ink text: highlight yellow for "On its way", mint for "Delivered".

**Option card (radio).** Full-width label containing a native radio, a title with a muted second line, and the price on the right. 2px border: line color when unselected, accent when selected. 60 to 64px high.

**Checkbox row.** Native checkbox (20px, accent color) and label text in a 44px high row. Used in the filter sidebar.

**Card.** White, no border, no shadow, 16px padding on phone and 24px on desktop.

**Summary rows.** Label in muted color on the left, value on the right in weight 600 with tabular numerals. The total sits below a divider with the amount in the display font.

**Accordion row.** Full-width button, 52 to 56px high, label weight 700, plus icon on the right, 1px divider above. Opening a row rotates the plus 45 degrees, reveals muted body text below and closes the other row. Set `aria-expanded`. The first row is open by default.

**Hero banner.** Accent block with a small highlight-yellow badge ("Just landed"), a very large white display headline, one line of muted-on-accent text and a white pill button. On the right, the photo sits in a highlight-yellow arch (fully rounded top corners) that touches the bottom edge of the block.

**Room tile.** Solid tile-color block with the room name in the display font, bottom left, ink text. 168px high in a 5-column grid on desktop; 132 x 104px in a horizontal scroll row on phone. The whole tile is a link.

**Promo band.** Highlight-yellow block with a heavy display headline in ink and one action: an ink pill button on desktop, an underlined ink text link on phone. One per page at most.

**Fact chips.** Small non-interactive pills (32 to 34px high, weight 600) listing key product facts such as "350 ml" or "Dishwasher safe". Ground-colored on the phone's white sheet, white on desktop. Three or four at most, from product data.

**Delivery note.** Rounded box with a truck icon, a bold line ("Free standard delivery") and a muted line ("Arrives in 3–5 working days"). Same background rule as fact chips. Text comes from the delivery settings.

**Desktop header.** One wrapping row: wordmark (display font, 28px, weight 800), category links (44px pills, weight 600), search field that fills the remaining width, then account, saved and bag icon links. The icon for the current page (account, saved or bag) is filled like a dark button. The bag shows a highlight-yellow count badge. Checkout and log in use a reduced header: wordmark and one back link.

**Phone tab bar.** White bar with a top divider and five items: Home, Shop, Saved, Bag, Account. 22px icon above an 11.5px label. Active item is accent, others muted. Leave room for the device safe area below it.

**Phone bottom action bar.** White bar with a top divider, pinned to the bottom of product, bag, checkout and order-placed screens. It holds the total (where relevant) and the primary button. The tab bar is hidden on these screens.

**Footer (desktop).** White block with four columns that wrap: the wordmark with a newsletter sign-up (email field in a ground-colored pill with a dark "Sign up" button inside it), "Shop" links, "Help" links, and contact details. Below a divider: "© [Your shop]" on the left and accepted payment methods on the right, both muted. Checkout and log in keep a reduced footer: a top divider, the copyright and three help links.

**Empty state.** White card with a display-font title, one muted sentence and a dark button. Example: "Your bag is empty", "Anything you add will show up here.", "Keep shopping".

## 4. States (not drawn in the mockups)

- **Hover** (pointer devices only): primary button background becomes accent-hover. Dark button becomes `#2A2F38`. Light buttons and icon buttons get an inset 1.5px ink ring. Text links underline. On a product card the name underlines.
- **Focus-visible:** 2px accent outline with 2px offset on every interactive element. On accent backgrounds the outline is white. Never remove focus outlines.
- **Pressed:** scale to 0.98.
- **Disabled:** 45% opacity, `not-allowed` cursor, no hover change.
- **Loading:** a submitting button keeps its width, becomes disabled and its label changes (for example "Placing order…"). While product data loads, show plain color tiles with no photo and muted bars in place of name and price.
- **Saved:** the heart icon fills with ink and the button sets `aria-pressed="true"`.
- **Form error:** field border becomes danger color, with a 14.5px danger message directly below the field, linked with `aria-describedby`. Validate on blur and on submit, not on every keystroke.
- **Motion:** 150ms ease-out on color, outline and transform. Turn transitions off under `prefers-reduced-motion`.

## 5. Screens

**Home.** Same section order on both sizes: hero banner, "Shop by room" room tiles, "Popular right now" with a "See all" link, promo band, "Just in". Phone: wordmark and bag button, search and category chips above the hero; room tiles and "Just in" scroll horizontally; "Popular right now" is a 2-column grid; tab bar at the bottom. Desktop: header, then each product section is a 4-column grid of product cards; footer.

**Category.** Page title with the item count beside it. Phone: Filter and Sort pills above a 2-column grid, tab bar with Shop active. Desktop: Sort pill on the right of the title row, a white filter sidebar (Type and Price checkbox groups) beside a 3-column grid.

**Product.** Phone: full-bleed photo on the selected color's tile color, with back and save buttons over it and page dots, then a white sheet with 28px top corners overlapping the photo by 24px. The sheet holds, in order: category label, title and price on one line, a one-sentence description, stock line, fact chips, size picker, color swatches, delivery note, accordion rows, reviews, and a "Goes well with" row of compact product cards. The bottom bar has the stepper and "Add to bag · €total". Desktop: photo gallery with four 88px thumbnails on the left; on the right a breadcrumb, title, price, stock line, description, fact chips, size picker, swatches, then stepper, Add to bag and save in one row, then the delivery note and accordion rows. Below both columns: reviews, then "Goes well with" as a 4-column grid of product cards. "Add to bag" opens the added-to-bag panel on both sizes.

**Bag.** Each item is a white card with a small color tile, name, variant, stepper, line total and a remove button. Below (phone) or beside (desktop) are a promo code field with an Apply text button, Subtotal, Delivery ("Chosen at checkout"), the Total and "Go to checkout". Shows the empty state when there are no items.

**Checkout.** Both sizes start with express checkout. Desktop also shows "Checking out as a guest. Log in" beside it; an account is never required to order. Desktop: three white cards in the main column (Contact and shipping, Delivery, Payment) and a "Your order" summary card with the item list, totals and "Place order" with a lock icon. Phone: compact cards showing the saved address and card, each with a Change text button, the delivery options and the bottom bar with the total and "Place order". For a first-time customer on phone, use the same fields as desktop, stacked in one column.

**Order placed.** Accent block with a white check circle, "Order placed" and a line saying where the confirmation was sent. Below: order details (order number, email, ship to, delivery, payment) and the order summary. Actions: "Keep shopping" (primary) and "View order".

**Search.** Phone: tapping the home search field opens the search screen, with a back button, the search field (with a clear button) and results in the 2-column grid. Desktop: the header search field holds the query and the page shows "Results for “query”", the item count, a sort pill and the product grid. No results: empty state with "No results for “query”", "Check the spelling or try a broader word." and a "Browse Kitchen" button.

**Saved.** Page title "Saved" with the item count and a grid of product cards whose heart is filled. Tapping the heart removes the card. Empty state: "Nothing saved yet".

**Log in.** Phone: a mint block with a back button and "Welcome back" in the display font, then email, password, "Forgot password?", "Log in" (primary), "Continue as guest" (light) and "Create an account". Desktop: an accent panel with the headline and a yellow photo arch beside a white form card with the same fields and actions.

**Account.** "Hi, [First name]" with the email below. Phone: order cards, then a list card of account rows (Details and password, Addresses, Payment methods) and "Log out". Desktop: a white side menu (Orders, Details and password, Addresses, Payment methods, Email preferences, Log out) beside the list of order cards.

## 6. Behavior

- Money is shown with the currency symbol first and two decimals ("€18.00"), always in tabular numerals. Currency and prices are sample values; read them from config and data.
- Changing a quantity updates the line total, subtotal, total and the bag badge immediately.
- Removing the last item shows the empty state.
- Selecting a delivery option updates the delivery line and the total immediately. Free delivery shows the word "Free", not "€0.00".
- "Add to bag" adds the selected size, color and quantity, updates the bag badge and opens the added-to-bag panel. It does not navigate away.
- Search filters as the query changes and shows the result count. Clearing the field shows all products.
- Filter choices combine: any selected Type and any selected Price, plus "In stock only". The count on the button updates with every change.
- Removing a product from Saved updates the count immediately.
- After a successful order the bag is empty and the header bag shows no badge.

## 7. Accessibility

- Use real elements: `<button>` for actions, `<a href>` for navigation, `<input>` with a `<label>` for every field (visually hidden labels are fine for search and promo code). "Place order" is a submit button in a real form.
- Icon-only buttons need an `aria-label` that names the target, for example "Save Stoneware mug" or "Remove Oak tray".
- Radios and checkboxes are native inputs inside `<fieldset>` with a `<legend>`.
- Toggle buttons (save, color swatches, chips) set `aria-pressed`. The current page link sets `aria-current="page"`.
- Announce changing totals with `aria-live="polite"`.
- Text contrast is at least 4.5:1. Muted text (`#565E69`) is the lightest text color allowed on ground or white. White text may only sit on accent or ink.
- Selected states never rely on color alone: they also change a border, ring or fill.

## 8. Do not

- Add shadows, gradients or card borders, or any color outside section 2.
- Put white text on a tile color or on highlight yellow; those always take ink text.
- Use highlight yellow for buttons or links; it is for badges, the hero arch and the promo band only.
- Use any typeface other than the two above, or the display font for body text or buttons.
- Use square or slightly rounded buttons; every button and chip is a pill.
- Draw fake device chrome (status bars, keyboards).
- Put more than one primary button on a screen.
- Invent ratings, review counts, stock numbers or marketing claims that are not in the data.