export type MessageRole = "user" | "assistant"

export type StreamStatus = "idle" | "streaming" | "complete" | "error"

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  isStreaming: boolean
  mapUrls?: string[]
  sources?: { service_name: string; base_url: string }[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
