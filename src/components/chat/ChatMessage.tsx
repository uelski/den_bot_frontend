import { memo } from "react"
import type { Message } from "@/types/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StreamingText } from "./StreamingText"
import { InlineMarkdown } from "./InlineMarkdown"
import { MapViewerCard } from "./MapViewerCard"
import { SourcesCard } from "./SourcesCard"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export const ChatMessage = memo(function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[75%] break-words rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {message.isStreaming ? (
          <StreamingText content={message.content} isStreaming />
        ) : (
          <InlineMarkdown content={message.content} />
        )}
        {message.mapUrls?.map((url) => (
          <MapViewerCard key={url} url={url} />
        ))}
        {message.sources && message.sources.length > 0 && (
          <SourcesCard sources={message.sources} />
        )}
      </div>
    </div>
  )
})
