import type { SSEEvent } from "./types"

interface SSECallbacks {
  onEvent: (event: SSEEvent) => void
  onError?: (error: Error) => void
}

export function createSSEConnection(
  url: string,
  body: Record<string, unknown>,
  callbacks: SSECallbacks
): AbortController {
  const controller = new AbortController()

  const run = async () => {
    let receivedDone = false

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No readable stream in response")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        let currentEvent = ""
        let currentData = ""

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6)
          } else if (line.trim() === "" && (currentData || currentEvent)) {
            try {
              const parsed = currentData ? JSON.parse(currentData) : {}
              const eventType = currentEvent || parsed.type
              const event = { type: eventType, ...parsed } as SSEEvent
              if (eventType === "done") receivedDone = true
              callbacks.onEvent(event)
            } catch {
              callbacks.onEvent({ type: "token", data: currentData })
            }
            currentEvent = ""
            currentData = ""
          }
        }
      }

      if (!receivedDone) {
        callbacks.onEvent({ type: "done", data: "" })
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (!receivedDone) {
          callbacks.onEvent({ type: "done", data: "" })
        }
        return
      }
      const error = err instanceof Error ? err : new Error(String(err))
      callbacks.onEvent({ type: "error", data: error.message })
      callbacks.onError?.(error)
    }
  }

  run()
  return controller
}
