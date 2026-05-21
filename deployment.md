# Deployment — Cloudflare Workers Builds

## Prerequisites

- Code pushed to GitHub
- Domain owned and managed on Cloudflare

## Initial setup

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Workers** → **Connect to Git**

2. Configure the build:
   - **Build command:** `yarn build`
   - **Deploy command:** `npx wrangler deploy` (default for Workers Builds)
   - **Build output directory:** `dist` (set via `wrangler.jsonc` `assets`)
   - **Variables and Secrets** (scope: **Build**):
     - `NODE_VERSION` = `22`
     - `VITE_USE_MOCK_API` = `false`
     - `VITE_API_BASE_URL` = `https://your-backend-url`

3. Deploy — Cloudflare builds and deploys automatically on push to `main`.

4. Custom domain — Project settings → **Domains & Routes** → add domain. DNS records auto-configure since the domain is on Cloudflare.

## Subsequent deploys

Pushes to `main` auto-deploy. PRs get preview deployments automatically.

## Env vars are baked in at build time

`VITE_*` variables are read by Vite at build time and inlined into the JS
bundle — they're not runtime values. Changing one in the dashboard does
not affect already-deployed bundles. To pick up new values, trigger a new
build (push to `main`, or use Retry build on the latest deployment when
available).

`wrangler.jsonc` `vars` are runtime Worker variables and would not be
visible to the client bundle for this static-asset deployment, so don't
put `VITE_*` keys there.

## SPA routing

SPA fallback is handled by `wrangler.jsonc`:

```jsonc
"assets": {
  "not_found_handling": "single-page-application"
}
```

No `public/_redirects` file is needed.
