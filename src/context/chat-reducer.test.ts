import { describe, it, expect } from "vitest"
import { chatReducer, type ChatState } from "./chat-reducer"
import { makeMessage, makeSource, makeKbSource } from "@/test/helpers"

function makeState(overrides?: Partial<ChatState>): ChatState {
  return {
    conversationId: "conv-1",
    threadId: "thread-1",
    messages: [],
    streamStatus: "idle",
    error: null,
    ...overrides,
  }
}

describe("chatReducer", () => {
  describe("ADD_USER_MESSAGE", () => {
    it("appends the message and clears error", () => {
      const msg = makeMessage({ role: "user" })
      const state = makeState({ error: "old error" })
      const next = chatReducer(state, { type: "ADD_USER_MESSAGE", payload: msg })
      expect(next.messages).toHaveLength(1)
      expect(next.messages[0]).toBe(msg)
      expect(next.error).toBeNull()
    })
  })

  describe("ADD_ASSISTANT_MESSAGE", () => {
    it("appends the message and sets streamStatus to streaming", () => {
      const msg = makeMessage({ role: "assistant", isStreaming: true })
      const state = makeState()
      const next = chatReducer(state, { type: "ADD_ASSISTANT_MESSAGE", payload: msg })
      expect(next.messages).toHaveLength(1)
      expect(next.streamStatus).toBe("streaming")
    })
  })

  describe("APPEND_TOKEN", () => {
    it("appends text to the last assistant message", () => {
      const msg = makeMessage({ role: "assistant", content: "Hello" })
      const state = makeState({ messages: [msg] })
      const next = chatReducer(state, { type: "APPEND_TOKEN", payload: " world" })
      expect(next.messages[0].content).toBe("Hello world")
    })

    it("is a no-op when the last message is a user message", () => {
      const msg = makeMessage({ role: "user", content: "Hi" })
      const state = makeState({ messages: [msg] })
      const next = chatReducer(state, { type: "APPEND_TOKEN", payload: " extra" })
      expect(next.messages[0].content).toBe("Hi")
    })

    it("is a no-op when there are no messages", () => {
      const state = makeState()
      const next = chatReducer(state, { type: "APPEND_TOKEN", payload: "text" })
      expect(next.messages).toHaveLength(0)
    })
  })

  describe("APPEND_MAP_URLS", () => {
    it("appends map URLs to the last assistant message", () => {
      const msg = makeMessage({ role: "assistant" })
      const state = makeState({ messages: [msg] })
      const urls = [{ url: "https://map.test", label: "Test Map" }]
      const next = chatReducer(state, { type: "APPEND_MAP_URLS", payload: urls })
      expect(next.messages[0].mapUrls).toEqual(urls)
    })

    it("initializes mapUrls when undefined", () => {
      const msg = makeMessage({ role: "assistant", mapUrls: undefined })
      const state = makeState({ messages: [msg] })
      const urls = [{ url: "https://map.test", label: "Map" }]
      const next = chatReducer(state, { type: "APPEND_MAP_URLS", payload: urls })
      expect(next.messages[0].mapUrls).toEqual(urls)
    })

    it("appends to existing mapUrls", () => {
      const existing = [{ url: "https://a.test", label: "A" }]
      const msg = makeMessage({ role: "assistant", mapUrls: existing })
      const state = makeState({ messages: [msg] })
      const newUrls = [{ url: "https://b.test", label: "B" }]
      const next = chatReducer(state, { type: "APPEND_MAP_URLS", payload: newUrls })
      expect(next.messages[0].mapUrls).toHaveLength(2)
    })
  })

  describe("APPEND_SOURCE", () => {
    it("appends sources to the last assistant message", () => {
      const msg = makeMessage({ role: "assistant" })
      const state = makeState({ messages: [msg] })
      const sources = [makeSource()]
      const next = chatReducer(state, { type: "APPEND_SOURCE", payload: sources })
      expect(next.messages[0].sources).toEqual(sources)
    })

    it("initializes sources when undefined", () => {
      const msg = makeMessage({ role: "assistant", sources: undefined })
      const state = makeState({ messages: [msg] })
      const sources = [makeSource()]
      const next = chatReducer(state, { type: "APPEND_SOURCE", payload: sources })
      expect(next.messages[0].sources).toEqual(sources)
    })

    it("appends to existing sources", () => {
      const existing = [makeSource()]
      const msg = makeMessage({ role: "assistant", sources: existing })
      const state = makeState({ messages: [msg] })
      const newSources = [makeSource()]
      const next = chatReducer(state, { type: "APPEND_SOURCE", payload: newSources })
      expect(next.messages[0].sources).toHaveLength(2)
    })

    it("accumulates mixed legacy + knowledge_base sources across events", () => {
      const msg = makeMessage({ role: "assistant" })
      const state = makeState({ messages: [msg] })
      const first = chatReducer(state, {
        type: "APPEND_SOURCE",
        payload: [makeSource({ service_name: "Parks" })],
      })
      const second = chatReducer(first, {
        type: "APPEND_SOURCE",
        payload: [
          makeKbSource({
            document_title: "Denver Code of Ordinances",
            page_start: 11,
            page_end: 14,
          }),
        ],
      })
      expect(second.messages[0].sources).toHaveLength(2)
      // Discriminator survives accumulation.
      expect(second.messages[0].sources?.[1]).toMatchObject({
        source_collection: "knowledge_base",
        document_title: "Denver Code of Ordinances",
      })
    })
  })

  describe("STREAM_COMPLETE", () => {
    it("sets isStreaming to false and streamStatus to complete", () => {
      const msg = makeMessage({ role: "assistant", isStreaming: true })
      const state = makeState({ messages: [msg], streamStatus: "streaming" })
      const next = chatReducer(state, { type: "STREAM_COMPLETE" })
      expect(next.messages[0].isStreaming).toBe(false)
      expect(next.streamStatus).toBe("complete")
    })
  })

  describe("STREAM_ERROR", () => {
    it("sets isStreaming to false, streamStatus to error, and stores the error", () => {
      const msg = makeMessage({ role: "assistant", isStreaming: true })
      const state = makeState({ messages: [msg], streamStatus: "streaming" })
      const next = chatReducer(state, { type: "STREAM_ERROR", payload: "Something broke" })
      expect(next.messages[0].isStreaming).toBe(false)
      expect(next.streamStatus).toBe("error")
      expect(next.error).toBe("Something broke")
    })
  })

  describe("LOAD_CONVERSATION", () => {
    it("replaces state with loaded conversation", () => {
      const messages = [makeMessage(), makeMessage()]
      const state = makeState({ messages: [makeMessage()], error: "old" })
      const next = chatReducer(state, {
        type: "LOAD_CONVERSATION",
        payload: { id: "loaded-id", threadId: "loaded-thread", messages },
      })
      expect(next.conversationId).toBe("loaded-id")
      expect(next.threadId).toBe("loaded-thread")
      expect(next.messages).toBe(messages)
      expect(next.streamStatus).toBe("idle")
      expect(next.error).toBeNull()
    })
  })

  describe("NEW_CONVERSATION", () => {
    it("resets to empty state with new ID", () => {
      const state = makeState({
        messages: [makeMessage()],
        streamStatus: "complete",
        error: "old",
      })
      const next = chatReducer(state, {
        type: "NEW_CONVERSATION",
        payload: { id: "new-id", threadId: "new-thread" },
      })
      expect(next.conversationId).toBe("new-id")
      expect(next.threadId).toBe("new-thread")
      expect(next.messages).toEqual([])
      expect(next.streamStatus).toBe("idle")
      expect(next.error).toBeNull()
    })
  })

  describe("SET_TOOL_CALL", () => {
    it("sets toolCallLabel on the last assistant message", () => {
      const msg = makeMessage({ role: "assistant" })
      const state = makeState({ messages: [msg] })
      const next = chatReducer(state, { type: "SET_TOOL_CALL", payload: "Looking up weather…" })
      expect(next.messages[0].toolCallLabel).toBe("Looking up weather…")
    })

    it("is a no-op when the last message is a user message", () => {
      const msg = makeMessage({ role: "user" })
      const state = makeState({ messages: [msg] })
      const next = chatReducer(state, { type: "SET_TOOL_CALL", payload: "Using tool…" })
      expect(next.messages[0].toolCallLabel).toBeUndefined()
    })
  })

  describe("CLEAR_TOOL_CALL", () => {
    it("clears toolCallLabel on the last assistant message", () => {
      const msg = makeMessage({ role: "assistant", toolCallLabel: "Looking up weather…" })
      const state = makeState({ messages: [msg] })
      const next = chatReducer(state, { type: "CLEAR_TOOL_CALL" })
      expect(next.messages[0].toolCallLabel).toBeUndefined()
    })
  })

  describe("SET_RTD_ALERTS", () => {
    it("sets rtdAlerts on the last assistant message", () => {
      const msg = makeMessage({ role: "assistant" })
      const state = makeState({ messages: [msg] })
      const alerts = { totalActive: 49, alertsUrl: "https://app.rtd-denver.com/alerts" }
      const next = chatReducer(state, { type: "SET_RTD_ALERTS", payload: alerts })
      expect(next.messages[0].rtdAlerts).toEqual(alerts)
    })

    it("is a no-op when the last message is a user message", () => {
      const msg = makeMessage({ role: "user" })
      const state = makeState({ messages: [msg] })
      const alerts = { totalActive: 10, alertsUrl: "https://example.com" }
      const next = chatReducer(state, { type: "SET_RTD_ALERTS", payload: alerts })
      expect(next.messages[0].rtdAlerts).toBeUndefined()
    })
  })

  describe("CLEAR_ERROR", () => {
    it("sets error to null", () => {
      const state = makeState({ error: "some error" })
      const next = chatReducer(state, { type: "CLEAR_ERROR" })
      expect(next.error).toBeNull()
    })
  })
})
