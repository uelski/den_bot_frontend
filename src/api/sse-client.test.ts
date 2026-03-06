import { describe, it, expect, vi, beforeEach } from "vitest"
import { createSSEConnection } from "./sse-client"
import type { SSEEvent } from "./types"

// Helper to build a mock ReadableStream from an array of text chunks
function makeStream(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
}

function mockFetchOk(body: ReadableStream<Uint8Array>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      body,
    })
  )
}

function mockFetchError(status: number, statusText: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText,
      body: null,
    })
  )
}

// Wait for the async SSE run() to finish
function flush() {
  return new Promise((r) => setTimeout(r, 0))
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("createSSEConnection", () => {
  it("parses JSON token events and emits them", async () => {
    const events: SSEEvent[] = []
    mockFetchOk(
      makeStream('data: {"type":"token","data":"Hello"}\n\ndata: {"type":"token","data":" world"}\n\n')
    )

    createSSEConnection("http://test", {}, { onEvent: (e) => events.push(e) })
    await flush()

    expect(events).toContainEqual({ type: "token", data: "Hello" })
    expect(events).toContainEqual({ type: "token", data: " world" })
  })

  it("emits a done event when the stream ends", async () => {
    const events: SSEEvent[] = []
    mockFetchOk(makeStream('data: {"type":"token","data":"hi"}\n\n'))

    createSSEConnection("http://test", {}, { onEvent: (e) => events.push(e) })
    await flush()

    expect(events.at(-1)).toEqual({ type: "done", data: "" })
  })

  it("falls back to a raw token event when data is not valid JSON", async () => {
    const events: SSEEvent[] = []
    mockFetchOk(makeStream("data: not-json\n\n"))

    createSSEConnection("http://test", {}, { onEvent: (e) => events.push(e) })
    await flush()

    expect(events).toContainEqual({ type: "token", data: "not-json" })
  })

  it("calls onError and emits an error event on HTTP failure", async () => {
    const events: SSEEvent[] = []
    const errors: Error[] = []
    mockFetchError(500, "Internal Server Error")

    createSSEConnection("http://test", {}, {
      onEvent: (e) => events.push(e),
      onError: (err) => errors.push(err),
    })
    await flush()

    expect(events).toContainEqual(
      expect.objectContaining({ type: "error" })
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain("500")
  })

  it("emits done (not error) when aborted", async () => {
    const events: SSEEvent[] = []
    const errors: Error[] = []

    // fetch rejects with an AbortError when the signal fires
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        Object.assign(new DOMException("Aborted", "AbortError"))
      )
    )

    const controller = createSSEConnection("http://test", {}, {
      onEvent: (e) => events.push(e),
      onError: (err) => errors.push(err),
    })
    controller.abort()
    await flush()

    expect(errors).toHaveLength(0)
    expect(events.at(-1)).toEqual({ type: "done", data: "" })
  })

  it("handles chunks split across multiple reads", async () => {
    const events: SSEEvent[] = []
    // Split the SSE message across two separate chunks
    mockFetchOk(
      makeStream(
        'data: {"type":"token","data":"split"',
        '}\n\n'
      )
    )

    createSSEConnection("http://test", {}, { onEvent: (e) => events.push(e) })
    await flush()

    expect(events).toContainEqual({ type: "token", data: "split" })
  })
})
