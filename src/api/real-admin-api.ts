import type {
  AdminApiInterface,
  CreateUploadResponse,
  UploadMetadata,
} from "./admin-types"
import { AdminApiError } from "./admin-types"
import { API_BASE_URL } from "@/lib/constants"

function adminHeaders(password: string): HeadersInit {
  return { "X-Admin-Password": password }
}

export const realAdminApi: AdminApiInterface = {
  async validatePassword(password: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/validate-password`, {
      method: "POST",
      headers: adminHeaders(password),
    })
    if (!res.ok) {
      throw new AdminApiError(res.status)
    }
  },

  async createUploadUrl(
    metadata: UploadMetadata,
    password: string
  ): Promise<CreateUploadResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/pdf-upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminHeaders(password),
      },
      body: JSON.stringify(metadata),
    })
    if (!res.ok) {
      // Pydantic 422 bodies carry a `detail` array; surface a readable message.
      let message: string | undefined
      try {
        const body = await res.json()
        if (typeof body?.detail === "string") {
          message = body.detail
        } else if (Array.isArray(body?.detail)) {
          message = body.detail
            .map((d: { msg?: string }) => d.msg)
            .filter(Boolean)
            .join("; ")
        }
      } catch {
        // non-JSON error body — fall back to the status-based default
      }
      throw new AdminApiError(res.status, message)
    }
    return (await res.json()) as CreateUploadResponse
  },
}
