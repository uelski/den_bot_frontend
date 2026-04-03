import type { Message, StreamStatus } from "@/types/chat"
import { ChatMessage } from "./ChatMessage"
import { useAutoScroll } from "@/hooks/useAutoScroll"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  streamStatus: StreamStatus
}

export function MessageList({ messages, streamStatus }: MessageListProps) {
  const { scrollRef, isAtBottom, scrollToBottom } = useAutoScroll(
    streamStatus === "streaming"
  )

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Blue Cypher
          </h2>
          <p className="mt-2 text-muted-foreground">
            Ask me anything about Denver — population, neighborhoods, parks,
            transit, and more.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
      {!isAtBottom && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-md"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
