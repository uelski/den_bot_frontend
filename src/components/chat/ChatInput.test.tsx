import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { ChatInput } from "./ChatInput"

afterEach(() => {
  cleanup()
})

function renderInput(overrides?: {
  onSend?: () => void
  onStop?: () => void
  streamStatus?: "idle" | "streaming" | "complete" | "error"
}) {
  const props = {
    onSend: overrides?.onSend ?? vi.fn(),
    onStop: overrides?.onStop ?? vi.fn(),
    streamStatus: overrides?.streamStatus ?? ("idle" as const),
  }
  const { container } = render(<ChatInput {...props} />)
  return { props, container }
}

function getSubmitButton(container: HTMLElement) {
  return container.querySelector('button[type="submit"]') as HTMLButtonElement
}

function getStopButton(container: HTMLElement) {
  return container.querySelector('button[type="button"]') as HTMLButtonElement
}

describe("ChatInput", () => {
  it("renders a textarea and submit button", () => {
    const { container } = renderInput()
    expect(screen.getByPlaceholderText("Ask about Denver...")).toBeInTheDocument()
    expect(getSubmitButton(container)).toBeInTheDocument()
  })

  it("submit button is disabled when input is empty", () => {
    const { container } = renderInput()
    expect(getSubmitButton(container)).toBeDisabled()
  })

  it("calls onSend with trimmed input on form submit", () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    const textarea = screen.getByPlaceholderText("Ask about Denver...")
    fireEvent.change(textarea, { target: { value: "  hello  " } })
    fireEvent.submit(textarea.closest("form")!)
    expect(onSend).toHaveBeenCalledWith("hello")
  })

  it("clears input after submit", () => {
    renderInput()
    const textarea = screen.getByPlaceholderText("Ask about Denver...") as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: "test" } })
    fireEvent.submit(textarea.closest("form")!)
    expect(textarea.value).toBe("")
  })

  it("does not call onSend when input is whitespace only", () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    const textarea = screen.getByPlaceholderText("Ask about Denver...")
    fireEvent.change(textarea, { target: { value: "   " } })
    fireEvent.submit(textarea.closest("form")!)
    expect(onSend).not.toHaveBeenCalled()
  })

  it("submits on Enter key", () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    const textarea = screen.getByPlaceholderText("Ask about Denver...")
    fireEvent.change(textarea, { target: { value: "test" } })
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false })
    expect(onSend).toHaveBeenCalledWith("test")
  })

  it("does not submit on Shift+Enter", () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    const textarea = screen.getByPlaceholderText("Ask about Denver...")
    fireEvent.change(textarea, { target: { value: "test" } })
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it("disables textarea and shows stop button when streaming", () => {
    const onStop = vi.fn()
    const { container } = renderInput({ streamStatus: "streaming", onStop })
    const textarea = screen.getByPlaceholderText("Ask about Denver...")
    expect(textarea).toBeDisabled()
    const stopButton = getStopButton(container)
    expect(stopButton).toBeInTheDocument()
    fireEvent.click(stopButton)
    expect(onStop).toHaveBeenCalled()
  })
})
