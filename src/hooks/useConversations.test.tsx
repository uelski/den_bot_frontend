import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useConversations } from "./useConversations"
import {
  ConversationContext,
  type ConversationContextValue,
} from "@/context/ConversationContext"
import type { ReactNode } from "react"

describe("useConversations", () => {
  it("throws when used outside ConversationProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useConversations())).toThrow(
      "useConversations must be used within a ConversationProvider"
    )
    spy.mockRestore()
  })

  it("returns context value when inside ConversationProvider", () => {
    const mockValue: ConversationContextValue = {
      conversations: [],
      isLoading: false,
      loadConversations: vi.fn(),
      deleteConversation: vi.fn(),
      clearAll: vi.fn(),
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ConversationContext.Provider value={mockValue}>
        {children}
      </ConversationContext.Provider>
    )

    const { result } = renderHook(() => useConversations(), { wrapper })
    expect(result.current.conversations).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})
