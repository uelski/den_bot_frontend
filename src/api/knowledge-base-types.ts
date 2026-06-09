// One entry returned by GET /knowledge-base/documents. Matches the response
// item shape in docs/knowledge-base-api.md.
export interface KnowledgeBaseDocument {
  document_id: string
  document_title: string
  category: string | null
  source_url: string | null
  original_filename: string | null
  uploaded_at: string | null // ISO-8601
  num_chunks: number
  page_count: number
}

// Returned by GET /knowledge-base/documents/download. The download_url is a
// ~15-minute signed GCS URL — generate on click, never prefetch.
export interface DownloadUrlResponse {
  document_id: string
  download_url: string
}

// Thrown by the KB API on non-2xx. Carries the HTTP status so UIs can branch
// on 400 (bad id) / 404 (gone) / 422 (missing param) / 503 (env unset) etc.
export class KnowledgeBaseApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message ?? `Knowledge base request failed: ${status}`)
    this.name = "KnowledgeBaseApiError"
    this.status = status
  }
}

export interface KnowledgeBaseApiInterface {
  listDocuments(): Promise<KnowledgeBaseDocument[]>
  getDownloadUrl(documentId: string): Promise<DownloadUrlResponse>
}
