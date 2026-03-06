# Denver Data Bot Frontend

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
    mock/
      mock-chat-api.ts        # Simulates streaming with setTimeout delays
      mock-responses.ts       # Canned Denver city data responses

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
      AboutContent.tsx         # Static info about the bot

  context/
    ChatContext.tsx             # Active chat state via useReducer (handles rapid token dispatch)
    ConversationContext.tsx     # Conversation history list (reads/writes localStorage)

  hooks/
    useChat.ts                 # Wraps ChatContext
    useConversations.ts        # Wraps ConversationContext
    useAutoScroll.ts           # Interval-based scroll-to-bottom during streaming

  lib/
    utils.ts                   # shadcn cn() utility
    constants.ts               # API_BASE_URL, USE_MOCK_API, STORAGE_KEYS
    storage.ts                 # localStorage CRUD for conversations
    format-markdown.tsx        # Regex-based inline markdown parser (bold, italic, links)

  pages/
    ChatPage.tsx               # Route: /
    HistoryPage.tsx            # Route: /history
    AboutPage.tsx              # Route: /about

  types/
    chat.ts                    # Message, Conversation, MessageRole, StreamStatus
```

## Architecture Decisions

**SSE via fetch, not EventSource**: `EventSource` only supports GET. Chat requires POST with a request body, so `sse-client.ts` uses `fetch` + `ReadableStream.getReader()` to parse SSE format.

**useReducer for chat state**: Tokens arrive every 20-80ms during streaming. `useState` would cause stale closures. `useReducer` guarantees each dispatch sees the latest state.

**ChatMessage is memo'd**: Only the last (streaming) message re-renders per token. All previous messages skip re-render via `React.memo`.

**Auto-scroll uses a 100ms interval**: Not per-token (which would be excessive). Respects user scroll position — if user scrolls up, auto-scroll pauses and a "scroll to bottom" button appears.

**Mock API as default**: `VITE_USE_MOCK_API=true` by default. The mock simulates streaming by splitting canned responses into words with random delays. Swap to real backend by setting `VITE_USE_MOCK_API=false` and implementing `ChatApiInterface` in a new file.

**localStorage for persistence**: Conversations are small text. Saved on stream completion. `ConversationContext` keeps the in-memory list in sync.

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
npm run dev         # Start dev server
npm run build       # Type-check + production build
npm run lint        # ESLint
npm run preview     # Preview production build
```

## Environment Variables

Defined in `.env` (git-ignored). See `.env.example` for template.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_MOCK_API` | `true` | Use mock streaming API (`false` to use real backend) |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

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
