import type {
  ChatApiInterface,
  FeedbackPayload,
  FeedbackResponse,
  SendMessageRequest,
  SSEEvent,
} from "./types"
import type { Conversation } from "@/types/chat"
import {
  loadAllConversations,
  deleteConversation as removeConversation,
} from "@/lib/storage"
import { API_BASE_URL } from "@/lib/constants"
import { createSSEConnection } from "./sse-client"

// Raw event shapes as sent by the backend
type BackendServiceSource = {
  service_name: string
  base_url: string
  hub_url?: string
  neighborhood_name?: string
  doc_type?: string
  source_collection?: string
}

type BackendKnowledgeBaseSource = {
  source_collection: "knowledge_base"
  document_title: string
  document_id?: string
  source_url?: string
  page_start?: number
  page_end?: number
  category?: string
}

type BackendSource = BackendServiceSource | BackendKnowledgeBaseSource

type BackendMapUrl = { url: string; label: string }

type BackendEvent =
  | { type: "token"; text: string }
  | { type: "map_viewer"; urls: BackendMapUrl[] }
  | { type: "sources"; sources: BackendSource[] }
  | { type: "tool_call"; tool: string; status: string; args?: Record<string, unknown> }
  | { type: "tool_result"; tool: string; status: string; [key: string]: unknown }
  | { type: "done" }
  | { type: "error"; error: string }

export function normalizeEvent(raw: BackendEvent): SSEEvent {
  switch (raw.type) {
    case "token":
      return { type: "token", data: raw.text }
    case "map_viewer":
      return { type: "map_viewer", data: "", metadata: { urls: raw.urls } }
    case "sources":
      return { type: "sources", data: "", metadata: { sources: raw.sources } }
    case "tool_call":
      return { type: "tool_call", data: raw.tool, metadata: { args: raw.args } }
    case "tool_result": {
      const { type: _, ...rest } = raw
      return { type: "tool_result", data: raw.tool, metadata: rest }
    }
    case "done":
      return { type: "done", data: "" }
    case "error":
      return { type: "error", data: raw.error }
  }
}

export const realChatApi: ChatApiInterface = {
  sendMessage(
    req: SendMessageRequest,
    onEvent: (event: SSEEvent) => void
  ): AbortController {
    return createSSEConnection(
      `${API_BASE_URL}/query`,
      { query: req.message, thread_id: req.threadId },
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

  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      throw new Error(`Feedback submission failed: ${res.status}`)
    }
    return (await res.json()) as FeedbackResponse
  },
}
