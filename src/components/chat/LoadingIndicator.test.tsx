import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, cleanup, act } from "@testing-library/react"
import { LoadingIndicator } from "./LoadingIndicator"

describe("LoadingIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("renders a loading phrase with ellipsis", () => {
    const { container } = render(<LoadingIndicator />)
    expect(container.textContent).toMatch(/\.\.\.$/)
  })

  it("rotates phrase via setInterval", () => {
    // Mock random to return different values on successive calls
    let callCount = 0
    vi.spyOn(Math, "random").mockImplementation(() => {
      // Return 0 for initial render, then 0.99 for interval ticks
      return callCount++ === 0 ? 0 : 0.99
    })

    const { container } = render(<LoadingIndicator />)
    // After render, index should be 0 → "bluecifering..."
    expect(container.textContent).toContain("bluecifering")

    act(() => {
      vi.advanceTimersByTime(6000)
    })

    // After interval tick, random returns 0.99 → last phrase in LOADING_PHRASES
    expect(container.textContent).toContain("bacon-bloody-mary-ing")
  })

  it("renders an svg spinner icon", () => {
    const { container } = render(<LoadingIndicator />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})
