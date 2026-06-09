import { API_BASE_URL } from "@/lib/constants"
import {
  KnowledgeBaseApiError,
  type DownloadUrlResponse,
  type KnowledgeBaseApiInterface,
  type KnowledgeBaseDocument,
} from "./knowledge-base-types"

export const realKnowledgeBaseApi: KnowledgeBaseApiInterface = {
  async listDocuments(): Promise<KnowledgeBaseDocument[]> {
    const res = await fetch(`${API_BASE_URL}/knowledge-base/documents`)
    if (!res.ok) {
      throw new KnowledgeBaseApiError(res.status)
    }
    const body = (await res.json()) as { documents: KnowledgeBaseDocument[] }
    return body.documents ?? []
  },

  async getDownloadUrl(documentId: string): Promise<DownloadUrlResponse> {
    // document_id contains slashes (pdfs/<category>/<...>.pdf), so it must be
    // passed as a URL-encoded query parameter — never a path segment.
    const url = `${API_BASE_URL}/knowledge-base/documents/download?document_id=${encodeURIComponent(documentId)}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new KnowledgeBaseApiError(res.status)
    }
    return (await res.json()) as DownloadUrlResponse
  },
}
