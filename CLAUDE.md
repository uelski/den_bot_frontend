# Denver Data Bot Frontend

> **Next steps**: See [NEXT_STEPS.md](NEXT_STEPS.md) for current priorities.

AI-powered chat interface for querying Denver city data. The backend uses AI agents (RAG, crawling) to retrieve city data and streams LLM responses via SSE.

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS v4** (Vite plugin, no config file — configured in `vite.config.ts`)
- **shadcn/ui** (New York style, Zinc base color) — components live in `src/components/ui/`
- **React Router v7** (`react-router` package, no separate `react-router-dom`)
- **State**: React Context + `useReducer` (no external state library)
- **Node >=22** required (use `nvm use 22`)

## Project Structure

```
src/
  main.tsx                    # Entry: BrowserRouter > ConversationProvider > ChatProvider > Routes
  App.tsx                     # Layout shell: AppShell + <Outlet />
  index.css                   # Tailwind imports + shadcn CSS variables

  api/
    types.ts                  # SSEEvent, ChatApiInterface, SendMessageRequest
    sse-client.ts             # Generic fetch-based SSE stream reader (POST, not EventSource)
    chat-api.ts               # API facade — swaps mock/real via VITE_USE_MOCK_API env var
    admin-types.ts            # AdminApiInterface, UploadMetadata, CreateUploadResponse, AdminApiError
    admin-api.ts              # Admin API facade — swaps mock/real (same pattern as chat-api)
    real-admin-api.ts         # Real admin API (validate-password + pdf-upload-url; X-Admin-Password header)
    knowledge-base-types.ts   # KnowledgeBaseApiInterface, KnowledgeBaseDocument, DownloadUrlResponse, KnowledgeBaseApiError
    knowledge-base-api.ts     # Public KB API facade — swaps mock/real
    real-knowledge-base-api.ts # Real KB API (GET /knowledge-base/documents + .../download?document_id=…)
    mock/
      mock-chat-api.ts        # Simulates streaming with setTimeout delays
      mock-responses.ts       # Canned Denver city data responses
      mock-admin-api.ts       # Dev password + fake signed_url/required_headers
      mock-knowledge-base-api.ts # 3 canned KB docs + mock:// download sentinel

  components/
    ui/                       # shadcn/ui generated components (do not edit manually)
    layout/
      AppShell.tsx             # Full-height flex: Navbar + main content
      Navbar.tsx               # Top bar with NavLinks and "New Chat" button
    chat/
      ChatView.tsx             # Composes MessageList + ChatInput + error banner
      MessageList.tsx          # Scrollable messages with auto-scroll + "scroll to bottom" button
      ChatMessage.tsx          # Single message bubble (memo'd for streaming perf)
      ChatInput.tsx            # Auto-growing textarea + send/stop button
      StreamingText.tsx        # Renders content with blinking cursor during streaming
      InlineMarkdown.tsx       # Lightweight bold/italic/link formatter (regex, no library)
    history/
      ConversationList.tsx     # Sorted conversation list with "Clear All"
      ConversationCard.tsx     # Preview card with delete, navigates to chat on click
    about/
      AboutContent.tsx         # Static info about the bot + mounts UploadedDocsList
      UploadedDocsList.tsx     # Live KB-docs list (fetch on mount; View on denvergov.org + Download per doc)
    admin/
      AdminGate.tsx            # Password gate (status machine; calls adminApi.validatePassword)
      UploadPanel.tsx          # PDF picker + metadata + progress bar; orchestrates upload
      MetadataFields.tsx       # category Select + title/filename/source_url inputs

  context/
    ChatContext.tsx             # Active chat state via useReducer (handles rapid token dispatch)
    ConversationContext.tsx     # Conversation history list (reads/writes localStorage)

  hooks/
    useChat.ts                 # Wraps ChatContext
    useConversations.ts        # Wraps ConversationContext
    useAutoScroll.ts           # Interval-based scroll-to-bottom during streaming

  lib/
    utils.ts                   # shadcn cn() utility
    constants.ts               # API_BASE_URL, USE_MOCK_API, STORAGE_KEYS, ADMIN_PATH, PDF_CATEGORIES
    storage.ts                 # localStorage CRUD for conversations
    upload.ts                  # XHR PUT to GCS signed URL with progress + abort (mock:// simulated)
    download-document.ts       # openDocumentDownload: signed-URL fetch + window.open (mock:// no-op)
    format-markdown.tsx        # Regex-based inline markdown parser (bold, italic, links)

  pages/
    ChatPage.tsx               # Route: /
    HistoryPage.tsx            # Route: /history
    AboutPage.tsx              # Route: /about
    AdminPage.tsx              # Route: /admin-sv (hidden, unlinked; gate ⇆ upload panel)

  types/
    chat.ts                    # Message, Conversation, MessageRole, StreamStatus

e2e/
  smoke.spec.ts                # Playwright smoke test for the chat + history golden path (incl. KB Download button)
  admin-sv.spec.ts             # Playwright spec for the hidden /admin-sv gate + PDF upload (mock)
  about.spec.ts                # Playwright spec for the About-page Knowledge-base section (mock)
```

## Architecture Decisions

**SSE via fetch, not EventSource**: `EventSource` only supports GET. Chat requires POST with a request body, so `sse-client.ts` uses `fetch` + `ReadableStream.getReader()` to parse SSE format.

**useReducer for chat state**: Tokens arrive every 20-80ms during streaming. `useState` would cause stale closures. `useReducer` guarantees each dispatch sees the latest state.

**ChatMessage is memo'd**: Only the last (streaming) message re-renders per token. All previous messages skip re-render via `React.memo`.

**Auto-scroll uses a 100ms interval**: Not per-token (which would be excessive). Respects user scroll position — if user scrolls up, auto-scroll pauses and a "scroll to bottom" button appears.

**Mock API as default**: `VITE_USE_MOCK_API=true` by default. The mock simulates streaming by splitting canned responses into words with random delays. Swap to real backend by setting `VITE_USE_MOCK_API=false` and implementing `ChatApiInterface` in a new file.

**localStorage for persistence**: Conversations are small text. Saved on stream completion. `ConversationContext` keeps the in-memory list in sync.

**Hidden admin surface (`/admin-sv`)**: An unlinked, password-gated route for uploading PDFs to the knowledge base. It's a *standalone* route in `main.tsx` (outside the `<App />` shell — no Navbar) and is obscurity-only: the path ships in the public bundle, so the real gate is the server password (`X-Admin-Password` header on every admin call; held in `sessionStorage`). PDF bytes never touch our backend — `pdf-upload-url` returns a short-lived GCS signed URL and the browser `PUT`s straight to GCS with the returned headers verbatim (see `src/lib/upload.ts`). Full contract: `docs/admin-api.md`.

## Conventions

- **Import aliases**: Use `@/` for all `src/` imports (e.g., `import { useChat } from "@/hooks/useChat"`)
- **shadcn components**: Add via `npx shadcn@latest add <component>`. Do not manually edit files in `src/components/ui/`
- **Styling**: Tailwind utility classes only. No CSS modules, no `App.css`. Global styles in `index.css`
- **Formatting**: No full markdown library. `InlineMarkdown` handles **bold**, *italic*, and [links](url) via regex. Add more patterns there if needed
- **New pages**: Create component in `src/pages/`, add route in `src/main.tsx` inside the `<Route element={<App />}>` block, add NavLink in `Navbar.tsx`
- **New API endpoints**: Add methods to `ChatApiInterface` in `src/api/types.ts`, implement in both mock and real API files

## Commands

```bash
nvm use 22          # Required Node version
yarn dev            # Start dev server
yarn build          # Type-check + production build
yarn lint           # ESLint
yarn preview        # Preview production build
yarn test           # Run tests in watch mode
yarn test:run       # Run tests once (CI)
yarn e2e            # Run Playwright E2E suite (builds + serves)
yarn e2e:ui         # Open Playwright UI mode (interactive runner)
yarn e2e:debug      # Run with the Playwright inspector attached
```

## Environment Variables

Defined in `.env` (git-ignored). See `.env.example` for template.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_MOCK_API` | `true` | Use mock streaming API (`false` to use real backend) |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

## End-to-End Tests (Playwright)

E2E tests live in `e2e/` and exercise the built bundle in a real browser. They run against the **mock API** (`VITE_USE_MOCK_API=true`) so they're deterministic and don't need the backend running.

### Running locally

```bash
yarn e2e            # headless run, builds + serves on port 4173
yarn e2e:ui         # interactive UI mode — best for authoring/debugging
yarn e2e:debug      # step through with Playwright Inspector
```

Playwright's `webServer` config runs `yarn build && yarn preview` automatically. With `reuseExistingServer: !CI`, if you already have a server on `:4173` it'll attach to that instead of rebuilding.

### Configuration

- `playwright.config.ts` — chromium only, retains trace on failure, GitHub reporter in CI
- `VITE_USE_MOCK_API=true` is injected into the build env by the webServer config, overriding `.env`
- Vitest `include` is scoped to `src/**/*.test.{ts,tsx}` and explicitly excludes `e2e/**`, so `yarn test` and `yarn e2e` don't pick up each other's specs

### Conventions

- Unit/component tests: `src/**/*.test.{ts,tsx}` (vitest + testing-library)
- E2E tests: `e2e/**/*.spec.ts` (Playwright)
- Each E2E test should `localStorage.clear()` in `beforeEach` since conversations persist across page loads

### Selector strategy

Prefer accessible queries (`getByRole`, `getByPlaceholder`, `getByText`) over CSS selectors or `data-testid`. If a control isn't selectable by role, add an `aria-label` (e.g. the icon-only Send/Stop buttons in `ChatInput.tsx`) rather than a test-only attribute — it improves accessibility and stability together.

### Failed runs

Traces are saved under `test-results/` on failure. View with:

```bash
yarn playwright show-trace test-results/<run-dir>/trace.zip
```

The `test-results/`, `playwright-report/`, and `playwright/.cache/` directories are gitignored.

## Connecting the Real Backend

1. Set `VITE_USE_MOCK_API=false` in `.env`
2. Create `src/api/real-chat-api.ts` implementing `ChatApiInterface`
3. Use `createSSEConnection` from `src/api/sse-client.ts` for the `sendMessage` method
4. Import and wire it in `src/api/chat-api.ts`

Expected SSE format from backend:
```
data: {"type":"token","data":"Denver"}

data: {"type":"token","data":" has"}

data: {"type":"done","data":""}
```
