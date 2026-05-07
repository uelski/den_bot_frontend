import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { FeedbackTypePills } from "./FeedbackTypePills"

afterEach(() => {
  cleanup()
})

describe("FeedbackTypePills", () => {
  it("renders all four pills", () => {
    render(<FeedbackTypePills value="bug" onChange={vi.fn()} />)
    expect(screen.getByRole("tab", { name: "Bug" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Data source" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Loading text" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "General" })).toBeInTheDocument()
  })

  it("marks the active pill with aria-selected", () => {
    render(<FeedbackTypePills value="general" onChange={vi.fn()} />)
    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tab", { name: "Bug" })).toHaveAttribute(
      "aria-selected",
      "false"
    )
  })

  it("calls onChange with the pill value when clicked", () => {
    const onChange = vi.fn()
    render(<FeedbackTypePills value="bug" onChange={onChange} />)
    fireEvent.click(screen.getByRole("tab", { name: "Loading text" }))
    expect(onChange).toHaveBeenCalledWith("loading_text")
  })
})
