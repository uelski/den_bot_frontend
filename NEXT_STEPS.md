# Next Steps

Priorities for upcoming work on the frontend.

## Testing
- [x] Add unit tests for React components (110 tests across 21 files — vitest + jsdom + testing-library)
- [x] Set up test runner and CI-ready scripts (`yarn test`, `yarn test:run`)
- [ ] E2E tests (Playwright) — critical user flows: send message, receive streamed response, view sources, load conversation from history
- [ ] Integration tests for SSE streaming against a real or mock backend server
- [ ] Visual regression testing (Chromatic or Percy) for UI consistency across changes

## Update non-chat content
- [ ] Audit existing non-chat tabs (History, About) — what's there, what's stale, what's missing
- [ ] Review how conversations/messages are saved to localStorage — correctness, size limits, cleanup strategy
- [ ] Determine what additional information to surface outside the chat (data catalog, FAQ, usage tips, etc.)

## Deployment
- [ ] Set up CI/CD pipelines for `stage` and `main` branches targeting stage and prod environments
- [ ] Evaluate hosting: Cloudflare Pages vs GCP (Cloud Run, Firebase Hosting, etc.)
- [ ] Configure environment-specific builds (API URLs, feature flags per environment)
