import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { MessageList } from "./MessageList"
import { makeMessage } from "@/test/helpers"

afterEach(() => {
  cleanup()
})

describe("MessageList", () => {
  it("renders empty state when no messages", () => {
    render(<MessageList messages={[]} streamStatus="idle" />)
    expect(screen.getByText("Blue Cypher")).toBeInTheDocument()
    expect(
      screen.getByText(/Ask me anything about Denver/)
    ).toBeInTheDocument()
  })

  it("renders messages when provided", () => {
    const messages = [
      makeMessage({ role: "user", content: "What about parks?" }),
      makeMessage({ role: "assistant", content: "Denver has 200 parks" }),
    ]
    render(<MessageList messages={messages} streamStatus="idle" />)
    expect(screen.getByText("What about parks?")).toBeInTheDocument()
    expect(screen.getByText("Denver has 200 parks")).toBeInTheDocument()
  })
})
