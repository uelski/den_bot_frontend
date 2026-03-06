import { useContext } from "react"
import { ChatContext, type ChatContextValue } from "@/context/ChatContext"

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
