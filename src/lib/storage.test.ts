import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  loadAllConversations,
  saveConversation,
  deleteConversation,
  clearAllConversations,
} from "./storage"
import type { Conversation } from "@/types/chat"

// Minimal stub — storage.ts uses localStorage.getItem / setItem / removeItem
const store: Record<string, string> = {}
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
})

function makeConversation(id: string): Conversation {
  return {
    id,
    title: `Conversation ${id}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

beforeEach(() => {
  // Clear the in-memory store before each test
  Object.keys(store).forEach((k) => delete store[k])
})

describe("loadAllConversations", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadAllConversations()).toEqual([])
  })

  it("returns an empty array when stored JSON is invalid", () => {
    store["denver-bot-conversations"] = "not-json"
    expect(loadAllConversations()).toEqual([])
  })

  it("returns the stored conversations", () => {
    const conv = makeConversation("abc")
    store["denver-bot-conversations"] = JSON.stringify([conv])
    expect(loadAllConversations()).toEqual([conv])
  })
})

describe("saveConversation", () => {
  it("inserts a new conversation when the id does not exist", () => {
    const conv = makeConversation("1")
    saveConversation(conv)
    expect(loadAllConversations()).toHaveLength(1)
    expect(loadAllConversations()[0].id).toBe("1")
  })

  it("updates an existing conversation when the id already exists", () => {
    const conv = makeConversation("1")
    saveConversation(conv)

    const updated = { ...conv, title: "Updated Title" }
    saveConversation(updated)

    const all = loadAllConversations()
    expect(all).toHaveLength(1)
    expect(all[0].title).toBe("Updated Title")
  })

  it("appends without overwriting other conversations", () => {
    saveConversation(makeConversation("a"))
    saveConversation(makeConversation("b"))
    expect(loadAllConversations()).toHaveLength(2)
  })
})

describe("deleteConversation", () => {
  it("removes the conversation with the given id", () => {
    saveConversation(makeConversation("x"))
    saveConversation(makeConversation("y"))
    deleteConversation("x")
    const all = loadAllConversations()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe("y")
  })

  it("is a no-op when the id does not exist", () => {
    saveConversation(makeConversation("x"))
    deleteConversation("nonexistent")
    expect(loadAllConversations()).toHaveLength(1)
  })
})

describe("clearAllConversations", () => {
  it("removes all conversations from storage", () => {
    saveConversation(makeConversation("a"))
    saveConversation(makeConversation("b"))
    clearAllConversations()
    expect(loadAllConversations()).toEqual([])
  })
})
