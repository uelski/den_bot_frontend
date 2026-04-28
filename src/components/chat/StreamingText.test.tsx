import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { StreamingText } from "./StreamingText"

afterEach(() => {
  cleanup()
})

describe("StreamingText", () => {
  it("renders LoadingIndicator when streaming with empty content", () => {
    const { container } = render(<StreamingText content="" isStreaming />)
    // LoadingIndicator has a spinning svg
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("renders content with blinking cursor when streaming", () => {
    const { container } = render(
      <StreamingText content="Hello" isStreaming />
    )
    expect(container.textContent).toContain("Hello")
    // Blinking cursor is a span with animate-pulse
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("renders content without cursor when not streaming", () => {
    const { container } = render(
      <StreamingText content="Hello" isStreaming={false} />
    )
    expect(container.textContent).toContain("Hello")
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument()
  })

  it("renders tool call label below loading indicator when streaming with no content", () => {
    const { container } = render(
      <StreamingText content="" isStreaming toolCallLabel="Looking up weather…" />
    )
    expect(container.textContent).toContain("Looking up weather…")
  })

  it("does not render tool call label when there is content", () => {
    const { container } = render(
      <StreamingText content="Some text" isStreaming toolCallLabel="Looking up weather…" />
    )
    expect(container.textContent).not.toContain("Looking up weather…")
  })
})
