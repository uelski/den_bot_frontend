import { useEffect } from "react"
import { useConversations } from "@/hooks/useConversations"
import { ConversationCard } from "./ConversationCard"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function ConversationList() {
  const { conversations, isLoading, loadConversations, deleteConversation, clearAll } =
    useConversations()

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No conversations yet</h2>
          <p className="mt-1 text-muted-foreground">
            Start a chat and your conversations will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Conversation History</h2>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={clearAll}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            onDelete={deleteConversation}
          />
        ))}
      </div>
    </div>
  )
}
