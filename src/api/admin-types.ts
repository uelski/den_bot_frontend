import type { PdfCategory } from "@/lib/constants"

// Metadata the admin fills in for a PDF. Bound into the signed-URL headers
// by the backend (docs/admin-api.md § Endpoint 2).
export interface UploadMetadata {
  category: PdfCategory
  document_title: string
  original_filename: string
  source_url: string
}

// Response from POST /admin/pdf-upload-url. required_headers must be sent
// verbatim on the PUT to GCS — changing or dropping any → 403.
export interface CreateUploadResponse {
  signed_url: string
  object_path: string
  required_headers: Record<string, string>
}

// Thrown by the admin API on any non-2xx response. Carries the HTTP status so
// the UI can branch: 401 (re-prompt), 422 (validation), 429 (rate limit),
// 503 (admin unavailable), 5xx (generic).
export class AdminApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message ?? `Admin request failed: ${status}`)
    this.name = "AdminApiError"
    this.status = status
  }
}

export interface AdminApiInterface {
  // Resolves on a correct password (200), throws AdminApiError otherwise.
  validatePassword(password: string): Promise<void>
  // Resolves with the signed URL + headers, throws AdminApiError otherwise.
  createUploadUrl(
    metadata: UploadMetadata,
    password: string
  ): Promise<CreateUploadResponse>
}
