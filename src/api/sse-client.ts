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

        let currentData = ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            currentData = line.slice(6)
          } else if (line.trim() === "" && currentData) {
            try {
              const event = JSON.parse(currentData) as SSEEvent
              callbacks.onEvent(event)
            } catch {
              callbacks.onEvent({ type: "token", data: currentData })
            }
            currentData = ""
          }
        }
      }

      callbacks.onEvent({ type: "done", data: "" })
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        callbacks.onEvent({ type: "done", data: "" })
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
