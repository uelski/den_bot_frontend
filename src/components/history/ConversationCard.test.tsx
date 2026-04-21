import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { ConversationCard } from "./ConversationCard"
import { ChatContext } from "@/context/ChatContext"
import { defaultChatValue } from "@/test/render-with-providers"
import { makeConversation, makeMessage } from "@/test/helpers"

afterEach(() => {
  cleanup()
})

function renderCard(
  conversation?: ReturnType<typeof makeConversation>,
  onDelete?: () => void
) {
  const conv = conversation ?? makeConversation({
    title: "Test Conversation",
    messages: [
      makeMessage({ role: "user", content: "Hello" }),
      makeMessage({ role: "assistant", content: "Hi there" }),
    ],
  })
  const chatValue = defaultChatValue()
  return {
    chatValue,
    ...render(
      <MemoryRouter>
        <ChatContext.Provider value={chatValue}>
          <ConversationCard
            conversation={conv}
            onDelete={onDelete ?? vi.fn()}
          />
        </ChatContext.Provider>
      </MemoryRouter>
    ),
  }
}

describe("ConversationCard", () => {
  it("renders the conversation title", () => {
    renderCard()
    expect(screen.getByText("Test Conversation")).toBeInTheDocument()
  })

  it("renders message count", () => {
    renderCard()
    expect(screen.getByText("2 messages")).toBeInTheDocument()
  })

  it("calls onDelete with conversation id when delete button is clicked", () => {
    const onDelete = vi.fn()
    const conv = makeConversation({ id: "delete-me", title: "To Delete", messages: [] })
    renderCard(conv, onDelete)
    const deleteButton = screen.getByRole("button")
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith("delete-me")
  })

  it("calls loadConversation when card is clicked", () => {
    const { chatValue } = renderCard()
    const card = screen.getByText("Test Conversation").closest("[class*=cursor-pointer]")!
    fireEvent.click(card)
    expect(chatValue.loadConversation).toHaveBeenCalled()
  })
})
