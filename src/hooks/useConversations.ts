import { useContext } from "react"
import {
  ConversationContext,
  type ConversationContextValue,
} from "@/context/ConversationContext"

export function useConversations(): ConversationContextValue {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error(
      "useConversations must be used within a ConversationProvider"
    )
  }
  return context
}
