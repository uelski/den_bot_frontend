export type MessageRole = "user" | "assistant"

export type StreamStatus = "idle" | "streaming" | "complete" | "error"

// Legacy service-catalog / neighborhood source. Has no required discriminator —
// any value of source_collection other than "knowledge_base" (or its absence)
// is treated as one of these.
export interface ServiceSource {
  service_name: string
  base_url: string
  hub_url?: string
  neighborhood_name?: string
  doc_type?: string
  source_collection?: string
}

// New RAG knowledge-base source emitted by the backend's ingestion + query
// pipeline. Tagged by source_collection === "knowledge_base".
export interface KnowledgeBaseSource {
  source_collection: "knowledge_base"
  document_title: string
  // document_id is what the public download endpoint expects. Optional in the
  // type so older localStorage conversations (saved before this field existed)
  // still load — the Download button is just hidden when it's absent.
  document_id?: string
  source_url?: string
  page_start?: number
  page_end?: number
  category?: string
}

export type Source = ServiceSource | KnowledgeBaseSource

export function isKnowledgeBaseSource(s: Source): s is KnowledgeBaseSource {
  return s.source_collection === "knowledge_base"
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
  threadId: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
