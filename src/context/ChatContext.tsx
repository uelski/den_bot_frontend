import {
  createContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message, Source, Conversation } from "@/types/chat"
import type { StreamStatus } from "@/types/chat"
import { chatApi } from "@/api/chat-api"
import { saveConversation } from "@/lib/storage"
import { getToolLabel } from "@/lib/constants"
import { chatReducer } from "./chat-reducer"

export interface ChatContextValue {
  conversationId: string
  messages: Message[]
  streamStatus: StreamStatus
  error: string | null
  sendMessage: (text: string) => void
  stopStreaming: () => void
  loadConversation: (id: string, messages: Message[]) => void
  newConversation: () => void
  clearError: () => void
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    conversationId: uuidv4(),
    messages: [],
    streamStatus: "idle",
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const persistConversation = useCallback(
    (messages: Message[]) => {
      if (messages.length === 0) return
      const firstUserMsg = messages.find((m) => m.role === "user")
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) +
          (firstUserMsg.content.length > 60 ? "..." : "")
        : "New conversation"
      const conversation: Conversation = {
        id: state.conversationId,
        title,
        messages,
        createdAt: messages[0].timestamp,
        updatedAt: Date.now(),
      }
      saveConversation(conversation)
    },
    [state.conversationId]
  )

  const sendMessage = useCallback(
    (text: string) => {
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: text,
        timestamp: Date.now(),
        isStreaming: false,
      }
      dispatch({ type: "ADD_USER_MESSAGE", payload: userMessage })

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      }
      dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: assistantMessage })

      const controller = chatApi.sendMessage(
        { conversationId: state.conversationId, message: text },
        (event) => {
          switch (event.type) {
            case "token":
              dispatch({ type: "APPEND_TOKEN", payload: event.data })
              break
            case "map_viewer":
              if (event.metadata?.urls) {
                dispatch({
                  type: "APPEND_MAP_URLS",
                  payload: event.metadata.urls as { url: string; label: string }[],
                })
              }
              break
            case "sources":
              if (event.metadata?.sources) {
                dispatch({
                  type: "APPEND_SOURCE",
                  payload: event.metadata.sources as Source[],
                })
              }
              break
            case "tool_call":
              dispatch({
                type: "SET_TOOL_CALL",
                payload: getToolLabel(event.data),
              })
              break
            case "tool_result":
              if (
                event.data === "get_rtd_service_alerts" &&
                event.metadata?.ok === true
              ) {
                dispatch({
                  type: "SET_RTD_ALERTS",
                  payload: {
                    totalActive: (event.metadata.total_active as number) ?? 0,
                    alertsUrl:
                      (event.metadata.alerts_url as string) ??
                      "https://app.rtd-denver.com/alerts",
                  },
                })
              }
              break
            case "done":
              dispatch({ type: "STREAM_COMPLETE" })
              break
            case "error":
              dispatch({ type: "STREAM_ERROR", payload: event.data })
              break
          }
        }
      )

      abortRef.current = controller
    },
    [state.conversationId]
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const loadConversation = useCallback(
    (id: string, messages: Message[]) => {
      abortRef.current?.abort()
      dispatch({ type: "LOAD_CONVERSATION", payload: { id, messages } })
    },
    []
  )

  const newConversation = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: "NEW_CONVERSATION", payload: uuidv4() })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  // Persist conversation when streaming completes
  const prevStatusRef = useRef(state.streamStatus)
  if (
    prevStatusRef.current === "streaming" &&
    (state.streamStatus === "complete" || state.streamStatus === "error")
  ) {
    persistConversation(state.messages)
  }
  prevStatusRef.current = state.streamStatus

  return (
    <ChatContext.Provider
      value={{
        conversationId: state.conversationId,
        messages: state.messages,
        streamStatus: state.streamStatus,
        error: state.error,
        sendMessage,
        stopStreaming,
        loadConversation,
        newConversation,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
