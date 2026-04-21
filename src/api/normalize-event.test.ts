import { describe, it, expect } from "vitest"
import { normalizeEvent } from "./real-chat-api"

describe("normalizeEvent", () => {
  it("maps a token event", () => {
    expect(normalizeEvent({ type: "token", text: "Hello" })).toEqual({
      type: "token",
      data: "Hello",
    })
  })

  it("maps a map_viewer event", () => {
    const urls = [{ url: "https://map.test", label: "Map" }]
    expect(normalizeEvent({ type: "map_viewer", urls })).toEqual({
      type: "map_viewer",
      data: "",
      metadata: { urls },
    })
  })

  it("maps a sources event", () => {
    const sources = [{ service_name: "Parks", base_url: "https://api.test" }]
    expect(normalizeEvent({ type: "sources", sources })).toEqual({
      type: "sources",
      data: "",
      metadata: { sources },
    })
  })

  it("maps a done event", () => {
    expect(normalizeEvent({ type: "done" })).toEqual({
      type: "done",
      data: "",
    })
  })

  it("maps an error event", () => {
    expect(normalizeEvent({ type: "error", error: "Server failure" })).toEqual({
      type: "error",
      data: "Server failure",
    })
  })
})
