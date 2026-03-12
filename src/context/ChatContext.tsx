import {
  createContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message, StreamStatus, Conversation } from "@/types/chat"
import { chatApi } from "@/api/chat-api"
import { saveConversation } from "@/lib/storage"

interface ChatState {
  conversationId: string
  messages: Message[]
  streamStatus: StreamStatus
  error: string | null
}

type ChatAction =
  | { type: "ADD_USER_MESSAGE"; payload: Message }
  | { type: "ADD_ASSISTANT_MESSAGE"; payload: Message }
  | { type: "APPEND_TOKEN"; payload: string }
  | { type: "APPEND_MAP_URL"; payload: string }
  | { type: "APPEND_SOURCE"; payload: { service_name: string; base_url: string }[] }
  | { type: "STREAM_COMPLETE" }
  | { type: "STREAM_ERROR"; payload: string }
  | { type: "LOAD_CONVERSATION"; payload: { id: string; messages: Message[] } }
  | { type: "NEW_CONVERSATION"; payload: string }
  | { type: "CLEAR_ERROR" }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      }
    case "ADD_ASSISTANT_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        streamStatus: "streaming",
      }
    case "APPEND_TOKEN": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          content: last.content + action.payload,
        }
      }
      return { ...state, messages }
    }
    case "APPEND_MAP_URL": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          mapUrls: [...(last.mapUrls ?? []), action.payload],
        }
      }
      return { ...state, messages }
    }
    case "APPEND_SOURCE": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          sources: [...(last.sources ?? []), ...action.payload],
        }
      }
      return { ...state, messages }
    }
    case "STREAM_COMPLETE": {
      const messages = state.messages.map((m, i) =>
        i === state.messages.length - 1 ? { ...m, isStreaming: false } : m
      )
      return { ...state, messages, streamStatus: "complete" }
    }
    case "STREAM_ERROR": {
      const messages = state.messages.map((m, i) =>
        i === state.messages.length - 1 ? { ...m, isStreaming: false } : m
      )
      return {
        ...state,
        messages,
        streamStatus: "error",
        error: action.payload,
      }
    }
    case "LOAD_CONVERSATION":
      return {
        ...state,
        conversationId: action.payload.id,
        messages: action.payload.messages,
        streamStatus: "idle",
        error: null,
      }
    case "NEW_CONVERSATION":
      return {
        conversationId: action.payload,
        messages: [],
        streamStatus: "idle",
        error: null,
      }
    case "CLEAR_ERROR":
      return { ...state, error: null }
  }
}

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
              dispatch({ type: "APPEND_MAP_URL", payload: event.data })
              break
            case "sources":
              if (event.metadata?.sources) {
                dispatch({
                  type: "APPEND_SOURCE",
                  payload: event.metadata.sources as { service_name: string; base_url: string }[],
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
