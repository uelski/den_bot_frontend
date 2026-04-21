import type { Message, Source, Conversation } from "@/types/chat"

let counter = 0

export function makeMessage(overrides?: Partial<Message>): Message {
  counter++
  return {
    id: `msg-${counter}`,
    role: "assistant",
    content: "Hello",
    timestamp: Date.now(),
    isStreaming: false,
    ...overrides,
  }
}

export function makeConversation(overrides?: Partial<Conversation>): Conversation {
  counter++
  return {
    id: `conv-${counter}`,
    title: `Conversation ${counter}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

export function makeSource(overrides?: Partial<Source>): Source {
  counter++
  return {
    service_name: `Service ${counter}`,
    base_url: `https://example.com/api/${counter}`,
    ...overrides,
  }
}
