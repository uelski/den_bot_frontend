import { useNavigate } from "react-router"
import type { Conversation } from "@/types/chat"
import { useChat } from "@/hooks/useChat"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, MessageCircle } from "lucide-react"

interface ConversationCardProps {
  conversation: Conversation
  onDelete: (id: string) => void
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ConversationCard({
  conversation,
  onDelete,
}: ConversationCardProps) {
  const navigate = useNavigate()
  const { loadConversation } = useChat()
  const messageCount = conversation.messages.length
  const preview =
    conversation.messages[0]?.content.slice(0, 100) +
    ((conversation.messages[0]?.content.length ?? 0) > 100 ? "..." : "")

  const handleClick = () => {
    loadConversation(conversation.id, conversation.messages)
    navigate("/")
  }

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-medium truncate">
            {conversation.title}
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {messageCount} messages
            </span>
            <span className="mx-1.5">·</span>
            {timeAgo(conversation.updatedAt)}
          </CardDescription>
          {preview && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {preview}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(conversation.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
    </Card>
  )
}
