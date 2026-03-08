import type { ChatApiInterface, SendMessageRequest, SSEEvent } from "./types"
import type { Conversation } from "@/types/chat"
import {
  loadAllConversations,
  deleteConversation as removeConversation,
} from "@/lib/storage"
import { API_BASE_URL } from "@/lib/constants"
import { createSSEConnection } from "./sse-client"

// Raw event shapes as sent by the backend
type BackendEvent =
  | { type: "token"; text: string }
  | { type: "map_viewer"; url: string }
  | { type: "done" }
  | { type: "error"; message: string }

function normalizeEvent(raw: BackendEvent): SSEEvent {
  switch (raw.type) {
    case "token":
      return { type: "token", data: raw.text }
    case "map_viewer":
      return { type: "map_viewer", data: raw.url, metadata: { url: raw.url } }
    case "done":
      return { type: "done", data: "" }
    case "error":
      return { type: "error", data: raw.message }
  }
}

export const realChatApi: ChatApiInterface = {
  sendMessage(
    req: SendMessageRequest,
    onEvent: (event: SSEEvent) => void
  ): AbortController {
    return createSSEConnection(
      `${API_BASE_URL}/query`,
      { query: req.message },
      {
        onEvent: (event) => {
          // createSSEConnection parses JSON and puts it in event.data isn't quite right —
          // it passes the parsed object as SSEEvent directly. We re-parse from raw.
          // Since sse-client casts the parsed JSON as SSEEvent, we cast it back to BackendEvent.
          onEvent(normalizeEvent(event as unknown as BackendEvent))
        },
        onError: (err) => {
          onEvent({ type: "error", data: err.message })
        },
      }
    )
  },

  async getConversations(): Promise<Conversation[]> {
    return loadAllConversations()
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const all = loadAllConversations()
    return all.find((c) => c.id === id) ?? null
  },

  async deleteConversation(id: string): Promise<void> {
    removeConversation(id)
  },
}
