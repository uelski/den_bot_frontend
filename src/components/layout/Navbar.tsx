import { NavLink } from "react-router"
import { Button } from "@/components/ui/button"
import { useChat } from "@/hooks/useChat"
import { MessageSquarePlus } from "lucide-react"

export function Navbar() {
  const { newConversation } = useChat()

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold tracking-tight">
            Denver Data Bot
          </h1>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-md transition-colors ${
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
                `px-3 py-1.5 text-sm rounded-md transition-colors ${
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
                `px-3 py-1.5 text-sm rounded-md transition-colors ${
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
        <Button variant="outline" size="sm" onClick={newConversation}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </header>
  )
}
