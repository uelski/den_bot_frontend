import { knowledgeBaseApi } from "@/api/knowledge-base-api"
import { MOCK_DOWNLOAD_URL_PREFIX } from "@/api/mock/mock-knowledge-base-api"

// Fetch a fresh signed download URL for the given document_id, then open it
// in a new tab. Generate-on-click — signed URLs expire in ~15 min, so we
// never prefetch (docs/knowledge-base-api.md). The signed URL is opened with
// a top-level GET (window.open), so no CORS preflight is involved.
//
// On failure throws KnowledgeBaseApiError — callers can surface friendly text
// based on err.status (400/404/422/503/etc.).
export async function openDocumentDownload(documentId: string): Promise<void> {
  const res = await knowledgeBaseApi.getDownloadUrl(documentId)
  if (res.download_url.startsWith(MOCK_DOWNLOAD_URL_PREFIX)) {
    // Mock mode: don't actually navigate. Surface a friendly hint so the
    // click-flow is testable in dev without a real bucket behind it.
    console.info(
      `[mock] would download ${documentId} via ${res.download_url}`
    )
    return
  }
  window.open(res.download_url, "_blank", "noopener,noreferrer")
}
