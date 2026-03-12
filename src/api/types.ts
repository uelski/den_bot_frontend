import type { Conversation } from "@/types/chat"

export interface SendMessageRequest {
  conversationId: string
  message: string
}

export interface SSEEvent {
  type: "token" | "done" | "error" | "metadata" | "map_viewer" | "sources"
  data: string
  metadata?: Record<string, unknown>
}

export interface ChatApiInterface {
  sendMessage(
    req: SendMessageRequest,
    onEvent: (event: SSEEvent) => void
  ): AbortController
  getConversations(): Promise<Conversation[]>
  getConversation(id: string): Promise<Conversation | null>
  deleteConversation(id: string): Promise<void>
}
