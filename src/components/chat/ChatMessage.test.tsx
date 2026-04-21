import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { ChatMessage } from "./ChatMessage"
import { makeMessage, makeSource } from "@/test/helpers"

afterEach(() => {
  cleanup()
})

describe("ChatMessage", () => {
  it("renders user message content", () => {
    const msg = makeMessage({ role: "user", content: "Hello Denver" })
    render(<ChatMessage message={msg} />)
    expect(screen.getByText("Hello Denver")).toBeInTheDocument()
  })

  it("renders assistant message content", () => {
    const msg = makeMessage({ role: "assistant", content: "Denver is great" })
    render(<ChatMessage message={msg} />)
    expect(screen.getByText("Denver is great")).toBeInTheDocument()
  })

  it("shows loading indicator when streaming with empty content", () => {
    const msg = makeMessage({ role: "assistant", content: "", isStreaming: true })
    const { container } = render(<ChatMessage message={msg} />)
    // LoadingIndicator renders an svg spinner
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("does not render SourcesCard when streaming", () => {
    const msg = makeMessage({
      role: "assistant",
      content: "text",
      isStreaming: true,
      sources: [makeSource()],
    })
    render(<ChatMessage message={msg} />)
    expect(screen.queryByText("Sources")).not.toBeInTheDocument()
  })

  it("renders SourcesCard when sources present and not streaming", () => {
    const msg = makeMessage({
      role: "assistant",
      content: "text",
      isStreaming: false,
      sources: [makeSource({ service_name: "Denver Parks" })],
    })
    render(<ChatMessage message={msg} />)
    expect(screen.getByText("Sources")).toBeInTheDocument()
    expect(screen.getByText("Denver Parks")).toBeInTheDocument()
  })

  it("renders MapViewerCard when mapUrls present and not streaming", () => {
    const msg = makeMessage({
      role: "assistant",
      content: "text",
      isStreaming: false,
      mapUrls: [{ url: "https://map.test", label: "My Map" }],
    })
    render(<ChatMessage message={msg} />)
    expect(screen.getByText("My Map")).toBeInTheDocument()
  })
})
