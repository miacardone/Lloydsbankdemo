# Cardflo — White-label Merchant Portal

A merchant portal demo for [Cardflo](https://cardflo.io): transactions, smart
routing, settlements, disputes and reporting, running on a brand layer that can
be swapped per tenant without touching a component.

Built with Vite 8, React 19, React Router 7, Tailwind 3 and Recharts. No backend
— every screen reads from a deterministic mock dataset in `src/data`.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script                 | What it does                          |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Dev server with HMR                   |
| `npm run build`        | Production build to `dist/`           |
| `npm run preview`      | Serve the built output locally        |
| `npm run lint`         | oxlint over `src`                     |
| `npm run format`       | Prettier write                        |
| `npm run format:check` | Prettier check (this is what CI runs) |

Node 20 or newer.

---

## The point of the build

This is a **white-label** portal. One codebase serves several tenants, so the
rule the whole project is organized around is:

> **No component, page or chart contains a brand color.**

Everything resolves at runtime through CSS custom properties. `src/brand/applyBrand.js`
writes the active tenant's palette onto `document.documentElement` as
space-separated RGB channels, and `tailwind.config.js` consumes them with
`rgb(var(--cf-brand) / <alpha-value>)`. That indirection is what lets
`bg-brand/10` work on a color that only exists at runtime, and it means
switching tenants never remounts the React tree.

### Adding a tenant

1. Copy `src/brand/brands/cardflo.js` to `src/brand/brands/yourclient.js`.
2. Change the values.
3. Import and register it in `src/brand/brands/index.js`.

That is the entire checklist. No component changes, no CSS.

`src/brand/brands/meridian.js` exists as a worked example — a green tenant with
a serif display face and 2px corners instead of 10px. Use the brand switcher in
the top bar to flip between them and watch the palette, typography, corner
radius, logo, chart series and footer legal name all change at once.

---

## Brand tokens

Cardflo's navy (`#03072E`) is taken from the `theme-color` the live site
publishes. The rest of the ramp is **derived** to sit around it and is marked as
such in `src/brand/brands/cardflo.js`.

| Token           | Value     | Role                                        |
| --------------- | --------- | ------------------------------------------- |
| `brandDark`     | `#03072E` | Nav rail, dark surfaces, display type       |
| `brand`         | `#2450E8` | Primary actions, links, active nav          |
| `accent`        | `#00C08B` | Approvals, recovery, uplift — the good news |
| `surfaceSunken` | `#F5F7FB` | App background                              |
| `negative`      | `#D93F45` | Declines, chargebacks, threshold breaches   |

**When the official brand pack arrives, `src/brand/brands/cardflo.js` is the
only file that changes.** Drop in the real hexes, the real webfont href, and
everything downstream follows.

The logo is drawn as SVG (`src/components/brand/Glyph.jsx`), never imported as a
bitmap. Three lanes converging on one trunk — Cardflo's own thesis about
multi-acquirer routing. It renders in blue on white, white on navy, and whatever
a new tenant brings, without anyone exporting a PNG per tenant per background.

---

## Layout

```
src/
  brand/          Tenant definitions + the runtime CSS-variable applier
  components/
    brand/        Wordmark, monogram, glyph
    charts/       Recharts wrappers, themed from brand tokens
    layout/       AppShell, Sidebar, Topbar, Footer, PageHeader
    table/        DataTable — sort, search, filter, paginate, CSV export
    ui/           Button, Card, Badge, Modal, Field, Tabs, StatCard, Skeleton
  config/         App constants, feature flags, navigation
  data/           Deterministic mock datasets (swap for API calls)
  hooks/          useBrand, useTableState
  lib/            Formatting, CSV, classname helper
  pages/          One file per route
  styles/         Tailwind entry + fallback CSS variables
```

### Feature flags

`src/config/features.js` gates modules. Turning a flag off removes **both** the
nav entry and the route, so a tenant without a module cannot reach it by typing
the URL:

```js
export const features = {
  routing: true,
  settlements: true,
  alerts: true,
  riskNotices: true,
  monitoring: true,
  affiliateReporting: true,
};
```

The shape is already what a per-tenant entitlements endpoint would return.

### Data

Every dataset pulls from a seeded PRNG (`src/data/seed.js`), so the numbers are
identical on your laptop, in the sales deck and on Vercel. A demo that reshuffles
on refresh is a demo you cannot rehearse.

"Today" is pinned in `seed.js` so date ranges never drift out from under the
data. Nothing in `src/pages` imports anything other than the exported datasets,
so replacing this folder with API calls is a contained change.

---

## Environment

| Variable                   | Default   | What it does                             |
| -------------------------- | --------- | ---------------------------------------- |
| `VITE_DEFAULT_BRAND`       | `cardflo` | Which tenant loads first                 |
| `VITE_SHOW_BRAND_SWITCHER` | `true`    | Set `false` for a client demo            |
| `VITE_API_BASE_URL`        | _(blank)_ | Blank keeps the mock data and demo badge |

Copy `.env.example` to `.env.local` to override.

While `VITE_API_BASE_URL` is blank the footer carries a "Demo data — no live
accounts connected" badge, so a demo build is never mistaken for production.

---

## Notes and caveats

- **The palette is derived, not official.** See the brand tokens section above.
- **Acquirer names are real institutions; the figures attached to them are not.**
  Volumes, approval rates and effective rates in `src/data` are generated demo
  values, not published commercial terms.
- **Merchant names are fictional.** Acme, Harborlight, Kettle Row, Northwind.
- **Interactions are local-only.** Toggling a routing rule updates React state
  and nothing else. Nothing persists, because pretending to persist in a demo
  is worse than obviously not persisting.

## Accessibility

Skip-to-content link, visible focus rings throughout, `aria-sort` on sortable
columns, `role="switch"` toggles, screen-reader labels on icon-only controls,
and `prefers-reduced-motion` honored globally.
