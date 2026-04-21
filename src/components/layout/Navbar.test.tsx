import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { Navbar } from "./Navbar"
import { ChatContext } from "@/context/ChatContext"
import { defaultChatValue } from "@/test/render-with-providers"

// Mock useTheme to avoid localStorage/DOM side effects
vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "dark" as const, toggleTheme: mockToggleTheme }),
}))

const mockToggleTheme = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderNavbar(chatOverrides?: Parameters<typeof defaultChatValue>[0]) {
  const chatValue = defaultChatValue(chatOverrides)
  return {
    chatValue,
    ...render(
      <MemoryRouter>
        <ChatContext.Provider value={chatValue}>
          <Navbar />
        </ChatContext.Provider>
      </MemoryRouter>
    ),
  }
}

describe("Navbar", () => {
  it("renders navigation links", () => {
    renderNavbar()
    expect(screen.getByText("Chat")).toBeInTheDocument()
    expect(screen.getByText("History")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
  })

  it("renders the Blue Cypher branding", () => {
    renderNavbar()
    expect(screen.getByText("Blue Cypher")).toBeInTheDocument()
  })

  it("calls newConversation when New Chat button is clicked", () => {
    const { chatValue } = renderNavbar()
    fireEvent.click(screen.getByText("New Chat"))
    expect(chatValue.newConversation).toHaveBeenCalled()
  })

  it("calls toggleTheme when theme button is clicked", () => {
    renderNavbar()
    // Theme button is the one with an svg icon (Sun/Moon), not the "New Chat" text button
    const buttons = screen.getAllByRole("button")
    // First button should be theme toggle (ghost variant, icon only)
    const themeButton = buttons.find((b) => !b.textContent?.includes("New Chat"))!
    fireEvent.click(themeButton)
    expect(mockToggleTheme).toHaveBeenCalled()
  })
})
