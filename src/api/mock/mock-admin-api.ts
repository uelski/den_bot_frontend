import type {
  AdminApiInterface,
  CreateUploadResponse,
  UploadMetadata,
} from "../admin-types"
import { AdminApiError } from "../admin-types"

// Dev-only password for mock mode. Never used against the real backend (that
// password lives in the server's ADMIN_PASSWORD env). Only present here.
export const MOCK_ADMIN_PASSWORD = "denver-dev"

// Sentinel signed_url the mock returns; src/lib/upload.ts recognizes the
// mock:// scheme and simulates progress instead of doing a real PUT.
export const MOCK_SIGNED_URL_PREFIX = "mock://upload"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const mockAdminApi: AdminApiInterface = {
  async validatePassword(password: string): Promise<void> {
    await delay(400)
    if (password !== MOCK_ADMIN_PASSWORD) {
      throw new AdminApiError(401)
    }
  },

  async createUploadUrl(
    metadata: UploadMetadata,
    password: string
  ): Promise<CreateUploadResponse> {
    await delay(400)
    if (password !== MOCK_ADMIN_PASSWORD) {
      throw new AdminApiError(401)
    }
    const objectPath = `pdfs/${metadata.category}/${Date.now()}-${metadata.original_filename
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")}`
    return {
      signed_url: `${MOCK_SIGNED_URL_PREFIX}/${objectPath}`,
      object_path: objectPath,
      required_headers: {
        "Content-Type": "application/pdf",
        "x-goog-meta-document_id": objectPath,
        "x-goog-meta-document_title": metadata.document_title,
        "x-goog-meta-original_filename": metadata.original_filename,
        "x-goog-meta-category": metadata.category,
        "x-goog-meta-source_url": metadata.source_url,
        "x-goog-meta-uploaded_at": new Date().toISOString(),
      },
    }
  },
}
