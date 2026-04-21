import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useChat } from "./useChat"
import { ChatContext, type ChatContextValue } from "@/context/ChatContext"
import type { ReactNode } from "react"

describe("useChat", () => {
  it("throws when used outside ChatProvider", () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useChat())).toThrow(
      "useChat must be used within a ChatProvider"
    )
    spy.mockRestore()
  })

  it("returns context value when inside ChatProvider", () => {
    const mockValue: ChatContextValue = {
      conversationId: "test-id",
      messages: [],
      streamStatus: "idle",
      error: null,
      sendMessage: vi.fn(),
      stopStreaming: vi.fn(),
      loadConversation: vi.fn(),
      newConversation: vi.fn(),
      clearError: vi.fn(),
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ChatContext.Provider value={mockValue}>{children}</ChatContext.Provider>
    )

    const { result } = renderHook(() => useChat(), { wrapper })
    expect(result.current.conversationId).toBe("test-id")
    expect(result.current.messages).toEqual([])
  })
})
