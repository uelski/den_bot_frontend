# Next Steps

Priorities for upcoming work on the frontend.

## Testing
- [ ] Add unit tests for React components (ChatMessage, SourcesCard, MessageList, ChatInput, etc.)
- [ ] Evaluate additional testing paradigms — integration tests, E2E (Playwright/Cypress), visual regression
- [ ] Set up test runner and CI integration

## Update non-chat content
- [ ] Audit existing non-chat tabs (History, About) — what's there, what's stale, what's missing
- [ ] Review how conversations/messages are saved to localStorage — correctness, size limits, cleanup strategy
- [ ] Determine what additional information to surface outside the chat (data catalog, FAQ, usage tips, etc.)

## Deployment
- [ ] Set up CI/CD pipelines for `stage` and `main` branches targeting stage and prod environments
- [ ] Evaluate hosting: Cloudflare Pages vs GCP (Cloud Run, Firebase Hosting, etc.)
- [ ] Configure environment-specific builds (API URLs, feature flags per environment)
