import { render, type RenderOptions } from "@testing-library/react"
import { vi } from "vitest"
import type { ReactElement } from "react"
import { ChatContext, type ChatContextValue } from "@/context/ChatContext"
import {
  ConversationContext,
  type ConversationContextValue,
} from "@/context/ConversationContext"

export function defaultChatValue(
  overrides?: Partial<ChatContextValue>
): ChatContextValue {
  return {
    conversationId: "test-conv-id",
    messages: [],
    streamStatus: "idle",
    error: null,
    sendMessage: vi.fn(),
    stopStreaming: vi.fn(),
    loadConversation: vi.fn(),
    newConversation: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  }
}

export function defaultConversationValue(
  overrides?: Partial<ConversationContextValue>
): ConversationContextValue {
  return {
    conversations: [],
    isLoading: false,
    loadConversations: vi.fn(),
    deleteConversation: vi.fn(),
    clearAll: vi.fn(),
    ...overrides,
  }
}

export function renderWithChat(
  ui: ReactElement,
  overrides?: Partial<ChatContextValue>,
  renderOptions?: RenderOptions
) {
  return render(
    <ChatContext.Provider value={defaultChatValue(overrides)}>
      {ui}
    </ChatContext.Provider>,
    renderOptions
  )
}

export function renderWithConversations(
  ui: ReactElement,
  overrides?: Partial<ConversationContextValue>,
  renderOptions?: RenderOptions
) {
  return render(
    <ConversationContext.Provider value={defaultConversationValue(overrides)}>
      {ui}
    </ConversationContext.Provider>,
    renderOptions
  )
}

export function renderWithAllProviders(
  ui: ReactElement,
  chatOverrides?: Partial<ChatContextValue>,
  convOverrides?: Partial<ConversationContextValue>,
  renderOptions?: RenderOptions
) {
  return render(
    <ChatContext.Provider value={defaultChatValue(chatOverrides)}>
      <ConversationContext.Provider
        value={defaultConversationValue(convOverrides)}
      >
        {ui}
      </ConversationContext.Provider>
    </ChatContext.Provider>,
    renderOptions
  )
}
