import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act, fireEvent, screen, cleanup } from "@testing-library/react"
import { FeedbackFAB } from "./FeedbackFAB"
import { renderWithChat } from "@/test/render-with-providers"

vi.mock("@/api/chat-api", () => ({
  chatApi: {
    submitFeedback: vi.fn().mockResolvedValue({ success: true, id: "abc" }),
  },
}))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe("FeedbackFAB", () => {
  it("renders with pulse animation initially", () => {
    renderWithChat(<FeedbackFAB />)
    const fab = screen.getByRole("button", { name: "Send feedback" })
    expect(fab.className).toContain("animate-pulse")
  })

  it("removes pulse animation after 30 seconds", () => {
    renderWithChat(<FeedbackFAB />)
    const fab = screen.getByRole("button", { name: "Send feedback" })
    expect(fab.className).toContain("animate-pulse")
    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(fab.className).not.toContain("animate-pulse")
  })

  it("opens the panel when clicked and removes pulse", () => {
    renderWithChat(<FeedbackFAB />)
    const fab = screen.getByRole("button", { name: "Send feedback" })
    expect(fab).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(fab)
    expect(fab).toHaveAttribute("aria-expanded", "true")
    expect(fab.className).not.toContain("animate-pulse")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
