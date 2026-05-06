import type { Message, Source, RtdAlerts, StreamStatus } from "@/types/chat"

export interface ChatState {
  conversationId: string
  threadId: string
  messages: Message[]
  streamStatus: StreamStatus
  error: string | null
}

export type ChatAction =
  | { type: "ADD_USER_MESSAGE"; payload: Message }
  | { type: "ADD_ASSISTANT_MESSAGE"; payload: Message }
  | { type: "APPEND_TOKEN"; payload: string }
  | { type: "APPEND_MAP_URLS"; payload: { url: string; label: string }[] }
  | { type: "APPEND_SOURCE"; payload: Source[] }
  | { type: "SET_TOOL_CALL"; payload: string }
  | { type: "CLEAR_TOOL_CALL" }
  | { type: "SET_RTD_ALERTS"; payload: RtdAlerts }
  | { type: "STREAM_COMPLETE" }
  | { type: "STREAM_ERROR"; payload: string }
  | { type: "LOAD_CONVERSATION"; payload: { id: string; threadId: string; messages: Message[] } }
  | { type: "NEW_CONVERSATION"; payload: { id: string; threadId: string } }
  | { type: "CLEAR_ERROR" }

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
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
          toolCallLabel: undefined,
        }
      }
      return { ...state, messages }
    }
    case "APPEND_MAP_URLS": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          mapUrls: [...(last.mapUrls ?? []), ...action.payload],
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
    case "SET_TOOL_CALL": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          toolCallLabel: action.payload,
        }
      }
      return { ...state, messages }
    }
    case "CLEAR_TOOL_CALL": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          toolCallLabel: undefined,
        }
      }
      return { ...state, messages }
    }
    case "SET_RTD_ALERTS": {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          rtdAlerts: action.payload,
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
        threadId: action.payload.threadId,
        messages: action.payload.messages,
        streamStatus: "idle",
        error: null,
      }
    case "NEW_CONVERSATION":
      return {
        conversationId: action.payload.id,
        threadId: action.payload.threadId,
        messages: [],
        streamStatus: "idle",
        error: null,
      }
    case "CLEAR_ERROR":
      return { ...state, error: null }
  }
}
