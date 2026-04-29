export type MessageRole = "user" | "assistant"

export type StreamStatus = "idle" | "streaming" | "complete" | "error"

export interface Source {
  service_name: string
  base_url: string
  hub_url?: string
  neighborhood_name?: string
  doc_type?: string
}

export interface RtdAlerts {
  totalActive: number
  alertsUrl: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  isStreaming: boolean
  toolCallLabel?: string
  mapUrls?: { url: string; label: string }[]
  sources?: Source[]
  rtdAlerts?: RtdAlerts
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
