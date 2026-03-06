import type { ChatApiInterface } from "./types"
import { USE_MOCK_API } from "@/lib/constants"
import { mockChatApi } from "./mock/mock-chat-api"

// When the real backend is ready, import and use it here:
// import { realChatApi } from "./real-chat-api"

export const chatApi: ChatApiInterface = USE_MOCK_API
  ? mockChatApi
  : mockChatApi // Replace with realChatApi when backend is ready
