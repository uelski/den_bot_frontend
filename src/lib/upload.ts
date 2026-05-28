import { MOCK_SIGNED_URL_PREFIX } from "@/api/mock/mock-admin-api"

export interface UploadOptions {
  // Called with progress in [0, 1] as bytes are sent.
  onProgress?: (fraction: number) => void
  // Aborts the in-flight upload when fired.
  signal?: AbortSignal
}

export class UploadError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message ?? `Upload failed: ${status}`)
    this.name = "UploadError"
    this.status = status
  }
}

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload aborted")
    this.name = "UploadAbortedError"
  }
}

// PUT the PDF bytes to the GCS signed URL. required_headers must be passed
// through verbatim (docs/admin-api.md § "The PUT to GCS") — any change → 403.
//
// Uses XMLHttpRequest rather than fetch because fetch can't report upload
// progress. A mock:// signed URL (from mock-admin-api) is simulated instead of
// hitting the network.
export function uploadPdfToSignedUrl(
  file: File,
  signedUrl: string,
  requiredHeaders: Record<string, string>,
  options: UploadOptions = {}
): Promise<void> {
  if (signedUrl.startsWith(MOCK_SIGNED_URL_PREFIX)) {
    return simulateUpload(options)
  }

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", signedUrl)

    for (const [key, value] of Object.entries(requiredHeaders)) {
      xhr.setRequestHeader(key, value)
    }

    const onAbort = () => xhr.abort()
    if (options.signal) {
      if (options.signal.aborted) {
        reject(new UploadAbortedError())
        return
      }
      options.signal.addEventListener("abort", onAbort)
    }

    const cleanup = () => {
      options.signal?.removeEventListener("abort", onAbort)
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        options.onProgress?.(e.loaded / e.total)
      }
    }

    xhr.onload = () => {
      cleanup()
      if (xhr.status === 200 || xhr.status === 201) {
        options.onProgress?.(1)
        resolve()
      } else {
        reject(new UploadError(xhr.status, xhr.responseText || undefined))
      }
    }

    xhr.onerror = () => {
      cleanup()
      reject(new UploadError(0, "Network error during upload"))
    }

    xhr.onabort = () => {
      cleanup()
      reject(new UploadAbortedError())
    }

    xhr.send(file)
  })
}

// Mock-mode upload: tick progress 0 → 1 over ~1.2s, honoring the abort signal.
function simulateUpload(options: UploadOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let progress = 0
    const tick = () => {
      if (options.signal?.aborted) {
        clearInterval(interval)
        reject(new UploadAbortedError())
        return
      }
      progress = Math.min(1, progress + 0.1)
      options.onProgress?.(progress)
      if (progress >= 1) {
        clearInterval(interval)
        resolve()
      }
    }
    const interval = setInterval(tick, 120)
  })
}
