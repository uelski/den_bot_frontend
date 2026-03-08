import type { ChatApiInterface } from "./types"
import { USE_MOCK_API } from "@/lib/constants"
import { mockChatApi } from "./mock/mock-chat-api"
import { realChatApi } from "./real-chat-api"

export const chatApi: ChatApiInterface = USE_MOCK_API ? mockChatApi : realChatApi
