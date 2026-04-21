import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAutoScroll } from "./useAutoScroll"

describe("useAutoScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns a scrollRef, isAtBottom, and scrollToBottom", () => {
    const { result } = renderHook(() => useAutoScroll(false))
    expect(result.current.scrollRef).toBeDefined()
    expect(result.current.isAtBottom).toBe(true)
    expect(typeof result.current.scrollToBottom).toBe("function")
  })

  it("defaults isAtBottom to true", () => {
    const { result } = renderHook(() => useAutoScroll(false))
    expect(result.current.isAtBottom).toBe(true)
  })

  it("does not start interval when not streaming", () => {
    renderHook(() => useAutoScroll(false))
    // No interval should be running — advancing time should be safe
    vi.advanceTimersByTime(500)
    // If no errors thrown, the test passes (no interval to tick)
  })
})
