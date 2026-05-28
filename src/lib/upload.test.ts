import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  uploadPdfToSignedUrl,
  UploadError,
  UploadAbortedError,
} from "./upload"

function makeFile() {
  return new File(["%PDF-1.7 fake"], "test.pdf", { type: "application/pdf" })
}

// Minimal XMLHttpRequest stand-in we can drive from tests.
class FakeXHR {
  static instances: FakeXHR[] = []
  upload = { onprogress: null as ((e: ProgressEvent) => void) | null }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  status = 0
  responseText = ""
  headers: Record<string, string> = {}
  method = ""
  url = ""

  open(method: string, url: string) {
    this.method = method
    this.url = url
  }
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }
  send() {
    FakeXHR.instances.push(this)
  }
  abort() {
    this.onabort?.()
  }

  // test helpers
  emitProgress(loaded: number, total: number) {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent)
  }
  complete(status: number, responseText = "") {
    this.status = status
    this.responseText = responseText
    this.onload?.()
  }

  static last() {
    return FakeXHR.instances.at(-1)!
  }
}

describe("uploadPdfToSignedUrl — real (XHR) path", () => {
  beforeEach(() => {
    FakeXHR.instances = []
    vi.stubGlobal("XMLHttpRequest", FakeXHR)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sends required headers verbatim and resolves on 200", async () => {
    const headers = {
      "Content-Type": "application/pdf",
      "x-goog-meta-category": "ordinance",
    }
    const promise = uploadPdfToSignedUrl(makeFile(), "https://gcs/put", headers)
    const xhr = FakeXHR.last()
    expect(xhr.method).toBe("PUT")
    expect(xhr.headers).toEqual(headers)
    xhr.complete(200)
    await expect(promise).resolves.toBeUndefined()
  })

  it("reports progress as a 0..1 fraction", async () => {
    const onProgress = vi.fn()
    const promise = uploadPdfToSignedUrl(makeFile(), "https://gcs/put", {}, {
      onProgress,
    })
    const xhr = FakeXHR.last()
    xhr.emitProgress(50, 100)
    expect(onProgress).toHaveBeenCalledWith(0.5)
    xhr.complete(201)
    await expect(promise).resolves.toBeUndefined()
    // resolves to a final 1
    expect(onProgress).toHaveBeenLastCalledWith(1)
  })

  it("rejects with UploadError carrying the status on non-2xx", async () => {
    const promise = uploadPdfToSignedUrl(makeFile(), "https://gcs/put", {})
    const xhr = FakeXHR.last()
    xhr.complete(403, "denied")
    await expect(promise).rejects.toBeInstanceOf(UploadError)
    await promise.catch((err) => expect(err.status).toBe(403))
  })

  it("rejects with UploadAbortedError when the signal fires", async () => {
    const controller = new AbortController()
    const promise = uploadPdfToSignedUrl(makeFile(), "https://gcs/put", {}, {
      signal: controller.signal,
    })
    controller.abort()
    await expect(promise).rejects.toBeInstanceOf(UploadAbortedError)
  })
})

describe("uploadPdfToSignedUrl — mock path", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("simulates progress and resolves for a mock:// url", async () => {
    const onProgress = vi.fn()
    const promise = uploadPdfToSignedUrl(makeFile(), "mock://upload/x", {}, {
      onProgress,
    })
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
    expect(onProgress).toHaveBeenCalled()
    expect(onProgress).toHaveBeenLastCalledWith(1)
  })
})
