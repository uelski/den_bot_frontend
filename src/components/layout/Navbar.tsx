import { NavLink } from "react-router"
import { Button } from "@/components/ui/button"
import { useChat } from "@/hooks/useChat"
import { useTheme } from "@/hooks/useTheme"
import { MessageSquarePlus, Sun, Moon } from "lucide-react"

export function Navbar() {
  const { newConversation } = useChat()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/blue_cypher_logo_two.png"
              alt="Blue Cypher"
              className="h-10 sm:h-12"
            />
            <h1 className="hidden text-lg font-semibold tracking-tight sm:inline-block">
              Blue Cypher
            </h1>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-2 sm:px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `px-2 sm:px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              History
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-2 sm:px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              About
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={newConversation}
            aria-label="New chat"
            className="px-2 sm:px-3"
          >
            <MessageSquarePlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
