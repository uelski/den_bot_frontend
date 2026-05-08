import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  fireEvent,
  screen,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react"
import { useRef } from "react"
import { FeedbackPanel } from "./FeedbackPanel"
import { renderWithChat } from "@/test/render-with-providers"
import type { Message } from "@/types/chat"

const submitFeedback = vi.fn()

vi.mock("@/api/chat-api", () => ({
  chatApi: {
    submitFeedback: (...args: unknown[]) => submitFeedback(...args),
  },
}))

beforeEach(() => {
  submitFeedback.mockReset()
  submitFeedback.mockResolvedValue({ success: true, id: "abc" })
})

afterEach(() => {
  cleanup()
})

function renderPanel(opts?: {
  messages?: Message[]
  onClose?: () => void
}) {
  const onClose = opts?.onClose ?? vi.fn()
  const messages = opts?.messages ?? []
  function Wrapper() {
    const triggerRef = useRef<HTMLButtonElement>(null)
    return (
      <>
        <button ref={triggerRef} data-testid="trigger">
          open
        </button>
        <FeedbackPanel
          open
          openSeq={1}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      </>
    )
  }
  return renderWithChat(<Wrapper />, { messages })
}

function makeUserMessage(content: string): Message {
  return {
    id: "msg-1",
    role: "user",
    content,
    timestamp: 0,
    isStreaming: false,
  }
}

describe("FeedbackPanel", () => {
  it("auto-fills bug query from last user message", () => {
    renderPanel({
      messages: [makeUserMessage("how many parks does Denver have?")],
    })
    const queryInput = screen.getByLabelText(
      /Query you submitted/i
    ) as HTMLInputElement
    expect(queryInput.value).toBe("how many parks does Denver have?")
  })

  it("disables submit until required fields are filled", () => {
    renderPanel()
    const submit = screen.getByRole("button", { name: /Send feedback/i })
    expect(submit).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/What were you trying to do/i), {
      target: { value: "ask about parks" },
    })
    expect(submit).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/What went wrong/i), {
      target: { value: "got an error" },
    })
    expect(submit).not.toBeDisabled()
  })

  it("submits a bug payload with auto-filled query and email", async () => {
    renderPanel({
      messages: [makeUserMessage("traffic on i-70?")],
    })
    fireEvent.change(screen.getByLabelText(/What were you trying to do/i), {
      target: { value: "check traffic" },
    })
    fireEvent.change(screen.getByLabelText(/What went wrong/i), {
      target: { value: "no response" },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }))
    await waitFor(() => {
      expect(submitFeedback).toHaveBeenCalledWith({
        type: "bug",
        intent: "check traffic",
        problem: "no response",
        query: "traffic on i-70?",
        email: "user@example.com",
      })
    })
  })

  it("switches forms on pill click and preserves bug field state", () => {
    renderPanel()
    fireEvent.change(screen.getByLabelText(/What were you trying to do/i), {
      target: { value: "draft text" },
    })
    fireEvent.click(screen.getByRole("tab", { name: "General" }))
    expect(screen.getByLabelText(/Your feedback/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("tab", { name: "Bug" }))
    const intent = screen.getByLabelText(
      /What were you trying to do/i
    ) as HTMLTextAreaElement
    expect(intent.value).toBe("draft text")
  })

  it("submits a general payload without email when blank", async () => {
    renderPanel()
    fireEvent.click(screen.getByRole("tab", { name: "General" }))
    fireEvent.change(screen.getByLabelText(/Your feedback/i), {
      target: { value: "love the app" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }))
    await waitFor(() => {
      expect(submitFeedback).toHaveBeenCalledWith({
        type: "general",
        message: "love the app",
        email: undefined,
      })
    })
  })

  it("submits a loading_text payload with phrase only", async () => {
    renderPanel()
    fireEvent.click(screen.getByRole("tab", { name: "Loading text" }))
    fireEvent.change(
      screen.getByLabelText(/Your suggested loading message/i),
      { target: { value: "broncos-ing" } }
    )
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }))
    await waitFor(() => {
      expect(submitFeedback).toHaveBeenCalledWith({
        type: "loading_text",
        phrase: "broncos-ing",
        email: undefined,
      })
    })
  })

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn()
    renderPanel({ onClose })
    fireEvent.keyDown(window, { key: "Escape" })
    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose on outside click", () => {
    const onClose = vi.fn()
    const { container } = renderPanel({ onClose })
    fireEvent.mouseDown(container.ownerDocument.body)
    expect(onClose).toHaveBeenCalled()
  })

  it("does not close when clicking a portaled Radix Select option", () => {
    const onClose = vi.fn()
    renderPanel({ onClose })
    // Simulate Radix Select rendering its dropdown in a portal on document.body
    const portal = document.createElement("div")
    portal.setAttribute("data-slot", "select-content")
    const option = document.createElement("div")
    option.setAttribute("role", "option")
    portal.appendChild(option)
    document.body.appendChild(portal)
    try {
      fireEvent.mouseDown(option)
      expect(onClose).not.toHaveBeenCalled()
    } finally {
      document.body.removeChild(portal)
    }
  })

  it("shows a thank-you message after success", async () => {
    vi.useFakeTimers()
    submitFeedback.mockResolvedValue({ success: true, id: "x" })
    const onClose = vi.fn()
    renderPanel({ onClose })
    fireEvent.click(screen.getByRole("tab", { name: "General" }))
    fireEvent.change(screen.getByLabelText(/Your feedback/i), {
      target: { value: "great" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText(/Thanks for the feedback/i)).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(onClose).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it("shows an error and stays open on submission failure", async () => {
    submitFeedback.mockRejectedValueOnce(new Error("network down"))
    renderPanel()
    fireEvent.click(screen.getByRole("tab", { name: "General" }))
    fireEvent.change(screen.getByLabelText(/Your feedback/i), {
      target: { value: "test" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }))
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("network down")
    })
  })
})
