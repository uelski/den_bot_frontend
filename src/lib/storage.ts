import type { Conversation } from "@/types/chat"
import { STORAGE_KEYS } from "./constants"

export function loadAllConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)
    if (!raw) return []
    return JSON.parse(raw) as Conversation[]
  } catch {
    return []
  }
}

export function saveConversation(conversation: Conversation): void {
  const all = loadAllConversations()
  const index = all.findIndex((c) => c.id === conversation.id)
  if (index >= 0) {
    all[index] = conversation
  } else {
    all.push(conversation)
  }
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(all))
}

export function deleteConversation(id: string): void {
  const all = loadAllConversations().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(all))
}

export function clearAllConversations(): void {
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS)
}
