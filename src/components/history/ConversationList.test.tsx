import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { ConversationList } from "./ConversationList"
import { ConversationContext } from "@/context/ConversationContext"
import { ChatContext } from "@/context/ChatContext"
import {
  defaultConversationValue,
  defaultChatValue,
} from "@/test/render-with-providers"
import { makeConversation, makeMessage } from "@/test/helpers"

afterEach(() => {
  cleanup()
})

function renderList(
  convOverrides?: Parameters<typeof defaultConversationValue>[0]
) {
  return render(
    <MemoryRouter>
      <ChatContext.Provider value={defaultChatValue()}>
        <ConversationContext.Provider
          value={defaultConversationValue(convOverrides)}
        >
          <ConversationList />
        </ConversationContext.Provider>
      </ChatContext.Provider>
    </MemoryRouter>
  )
}

describe("ConversationList", () => {
  it("renders empty state when no conversations", () => {
    renderList()
    expect(screen.getByText("No conversations yet")).toBeInTheDocument()
  })

  it("renders conversations when provided", () => {
    const conversations = [
      makeConversation({
        title: "Parks Chat",
        messages: [makeMessage({ content: "hello" })],
      }),
    ]
    renderList({ conversations })
    expect(screen.getByText("Parks Chat")).toBeInTheDocument()
    expect(screen.getByText("Conversation History")).toBeInTheDocument()
  })
})
