import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { InlineMarkdown } from "./InlineMarkdown"

afterEach(() => {
  cleanup()
})

describe("InlineMarkdown", () => {
  it("renders plain text", () => {
    const { container } = render(<InlineMarkdown content="Hello world" />)
    expect(container.textContent).toBe("Hello world")
  })

  it("renders multiline content with line breaks", () => {
    const { container } = render(<InlineMarkdown content={"Line 1\nLine 2"} />)
    const brs = container.querySelectorAll("br")
    expect(brs).toHaveLength(1)
    expect(container.textContent).toBe("Line 1Line 2")
  })
})
