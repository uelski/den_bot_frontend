import type { ChatApiInterface, SendMessageRequest, SSEEvent } from "../types"
import type { Conversation } from "@/types/chat"
import {
  loadAllConversations,
  saveConversation as persistConversation,
  deleteConversation as removeConversation,
} from "@/lib/storage"
import { getMockResponse } from "./mock-responses"

export const mockChatApi: ChatApiInterface = {
  sendMessage(
    req: SendMessageRequest,
    onEvent: (event: SSEEvent) => void
  ): AbortController {
    const controller = new AbortController()
    const response = getMockResponse(req.message)
    const words = response.split(/(\s+)/)
    let index = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const emitNext = () => {
      if (controller.signal.aborted) return

      if (index < words.length) {
        onEvent({ type: "token", data: words[index] })
        index++
        const delay = 20 + Math.random() * 60
        timeouts.push(setTimeout(emitNext, delay))
      } else {
        onEvent({
          type: "sources",
          data: "",
          metadata: {
            sources: [
              {
                service_name: "Denver Parks",
                base_url: "https://data.denvergov.org/api/action/datastore_search",
                hub_url: "https://data.denvergov.org/dataset/city-and-county-of-denver-parks",
              },
              {
                service_name: "Denver Neighborhood Demographics (ACS 2017-2021)",
                base_url: "https://data.denvergov.org/api/action/datastore_search",
                hub_url: "https://data.denvergov.org/dataset/denver-neighborhoods-demographics",
                neighborhood_name: "Capitol Hill",
                doc_type: "neighborhood_demographics",
              },
              {
                service_name: "Denver Neighborhood Demographics (ACS 2017-2021)",
                base_url: "https://data.denvergov.org/api/action/datastore_search",
                hub_url: "https://data.denvergov.org/dataset/denver-neighborhoods-demographics",
                neighborhood_name: "Five Points",
                doc_type: "neighborhood_demographics",
              },
              {
                service_name: "Denver Neighborhood Demographics (ACS 2017-2021)",
                base_url: "https://data.denvergov.org/api/action/datastore_search",
                hub_url: "https://data.denvergov.org/dataset/denver-neighborhoods-demographics",
                neighborhood_name: "Globeville",
                doc_type: "neighborhood_demographics",
              },
            ],
          },
        })
        onEvent({ type: "done", data: "" })
      }
    }

    timeouts.push(setTimeout(emitNext, 300))

    controller.signal.addEventListener("abort", () => {
      timeouts.forEach(clearTimeout)
      onEvent({ type: "done", data: "" })
    })

    return controller
  },

  async getConversations(): Promise<Conversation[]> {
    return loadAllConversations()
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const all = loadAllConversations()
    return all.find((c) => c.id === id) ?? null
  },

  async deleteConversation(id: string): Promise<void> {
    removeConversation(id)
  },
}

export { persistConversation }
