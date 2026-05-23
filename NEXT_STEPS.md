# Next Steps

Priorities for upcoming work on the frontend.

## Recently shipped (2026-05-20)
- Mobile responsive pass — Navbar, FeedbackFAB positioning, chat bubble width, safe-area padding, MapViewerCard truncation, History/About scroll containers
- About-page rewrite — user-focused content (example questions, data sources, feedback explainer, beta caveat) + small tech footer with repo links
- Real backend wired up via Cloudflare Workers Builds dashboard env vars (`VITE_USE_MOCK_API=false`, `VITE_API_BASE_URL` → Cloud Run)
- `deployment.md` rewritten for Workers Builds (was still describing Pages flow)

## Testing
- [x] Add unit tests for React components (142 tests across 26 files — vitest + jsdom + testing-library)
- [x] Set up test runner and CI-ready scripts (`yarn test`, `yarn test:run`)
- [x] E2E tests (Playwright) — smoke spec covering chat send/stream/history-reload added (`e2e/smoke.spec.ts`). Extend with sources, theme toggle, new-chat reset as needed
- [ ] Integration tests for SSE streaming against a real or mock backend server
- [ ] Visual regression testing (Chromatic or Percy) for UI consistency across changes

## Non-chat surfaces
- [x] About page audit and rewrite — done
- [ ] History page audit — scroll handling added but copy/UX wasn't refreshed (empty state, card density, sort/filter)
- [ ] Review how conversations/messages are saved to localStorage — correctness, size limits, cleanup strategy
- [ ] Determine what additional information to surface outside the chat (data catalog, FAQ, usage tips, etc.)

## Deployment
- [x] Evaluate hosting — chose Cloudflare Workers Builds (migrated from local Docker/nginx setup)
- [ ] Set up CI/CD pipeline for a `stage` branch targeting a stage environment
- [ ] Configure environment-specific builds (separate stage/prod API URLs, feature flags per environment)
