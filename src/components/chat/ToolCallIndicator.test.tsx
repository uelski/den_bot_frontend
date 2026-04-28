import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { ToolCallIndicator } from "./ToolCallIndicator"

afterEach(() => {
  cleanup()
})

describe("ToolCallIndicator", () => {
  it("renders the label text", () => {
    const { container } = render(<ToolCallIndicator label="Looking up weather…" />)
    expect(container.textContent).toContain("Looking up weather…")
  })

  it("renders a search icon", () => {
    const { container } = render(<ToolCallIndicator label="Using tool…" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})
