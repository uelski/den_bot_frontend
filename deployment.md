# Deployment — Cloudflare Pages

## Prerequisites

- Code pushed to GitHub
- Domain owned and managed on Cloudflare

## Steps

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git

2. Configure the build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:**
     - `NODE_VERSION` = `22`
     - `VITE_USE_MOCK_API` = `false`
     - `VITE_API_BASE_URL` = `https://your-backend-url`

3. Deploy — Cloudflare builds and deploys automatically

4. Custom domain — In your Pages project settings → Custom domains → add your domain. Since the domain is already on Cloudflare, DNS records are configured automatically.

## Subsequent Deploys

Pushes to `main` auto-deploy. PRs get preview deployments automatically.

## SPA Routing

React Router needs SPA fallback routing. Cloudflare Pages handles this by default, but if you hit 404s on page refresh, create `public/_redirects`:

```
/* /index.html 200
```
