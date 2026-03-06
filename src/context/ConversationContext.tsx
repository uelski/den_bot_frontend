import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Conversation } from "@/types/chat"
import {
  loadAllConversations,
  deleteConversation as removeConversation,
  clearAllConversations,
} from "@/lib/storage"

export interface ConversationContextValue {
  conversations: Conversation[]
  isLoading: boolean
  loadConversations: () => void
  deleteConversation: (id: string) => void
  clearAll: () => void
}

export const ConversationContext =
  createContext<ConversationContextValue | null>(null)

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadConversations = useCallback(() => {
    setIsLoading(true)
    const loaded = loadAllConversations()
    loaded.sort((a, b) => b.updatedAt - a.updatedAt)
    setConversations(loaded)
    setIsLoading(false)
  }, [])

  const deleteConversation = useCallback((id: string) => {
    removeConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    clearAllConversations()
    setConversations([])
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        isLoading,
        loadConversations,
        deleteConversation,
        clearAll,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}
