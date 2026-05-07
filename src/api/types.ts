import type { Conversation } from "@/types/chat"

export interface SendMessageRequest {
  conversationId: string
  threadId: string
  message: string
}

export interface SSEEvent {
  type: "token" | "done" | "error" | "metadata" | "map_viewer" | "sources" | "tool_call" | "tool_result"
  data: string
  metadata?: Record<string, unknown>
}

export type FeedbackType = "bug" | "data_source" | "loading_text" | "general"

export type FeedbackPayload =
  | {
      type: "bug"
      intent: string
      problem: string
      query?: string
      email?: string
    }
  | {
      type: "data_source"
      category: string
      source: string
      usefulness: string
      email?: string
    }
  | {
      type: "loading_text"
      phrase: string
      email?: string
    }
  | {
      type: "general"
      message: string
      email?: string
    }

export interface FeedbackResponse {
  success: boolean
  id?: string
}

export interface ChatApiInterface {
  sendMessage(
    req: SendMessageRequest,
    onEvent: (event: SSEEvent) => void
  ): AbortController
  getConversations(): Promise<Conversation[]>
  getConversation(id: string): Promise<Conversation | null>
  deleteConversation(id: string): Promise<void>
  submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse>
}
