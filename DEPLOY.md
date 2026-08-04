# Deploying

## 1. Push to GitHub

The repo is initialised locally with one commit. Point it at your remote:

```bash
git remote add origin https://github.com/miaconcettacardone-ui/cardflo.git
git branch -M main
git push -u origin main
```

If the remote already has commits, use `git push -u origin main --force` — the
repo was empty at the time this was built.

## 2. Deploy on Vercel

`vercel.json` is already configured: Vite framework preset, `npm ci` install,
`dist` output, SPA rewrites so deep links like `/reports/mid-health` resolve, and
a one-year immutable cache on hashed assets.

**Via the dashboard**

1. Vercel → **Add New** → **Project**.
2. Import `miaconcettacardone-ui/cardflo`.
3. Leave every build setting alone — `vercel.json` supplies them.
4. Add environment variables (optional, all have sensible defaults):
   - `VITE_DEFAULT_BRAND` = `cardflo`
   - `VITE_SHOW_BRAND_SWITCHER` = `false` for a client-facing demo
5. **Deploy.**

**Via the CLI**

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

Pushes to `main` deploy to production; every other branch gets a preview URL.
Preview URLs are the useful bit here — put a partner's brand on a branch and
send them a link that only ever shows their own portal.

## 3. VS Code

```bash
code .
npm install
npm run dev
```

`.vscode/extensions.json` will prompt for the Tailwind IntelliSense and Prettier
extensions; `.vscode/settings.json` turns on format-on-save. The `@/` alias is
declared in both `jsconfig.json` and `vite.config.js`, so import autocomplete and
the bundler agree.

## CI

`.github/workflows/ci.yml` runs install, lint, format check and build on every
push and pull request. Vercel will still deploy if CI fails, so treat a red
check as a real signal.

## Before this goes in front of a client

- [ ] Replace the derived palette in `src/brand/brands/cardflo.js` with the
      official brand pack.
- [ ] Set `VITE_SHOW_BRAND_SWITCHER=false` so the tenant only sees their own brand.
- [ ] Decide whether the second tenant (`meridian`) should ship — remove it from
      `src/brand/brands/index.js` if not.
- [ ] Confirm the demo-data footer badge is wanted, or set `VITE_API_BASE_URL`.
