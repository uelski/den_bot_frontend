import { useChat } from "@/hooks/useChat"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"

export function ChatView() {
  const { messages, streamStatus, error, sendMessage, stopStreaming, clearError } =
    useChat()

  return (
    <div className="flex h-full flex-col">
      {error && (
        <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} streamStatus={streamStatus} />
      </div>
      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        streamStatus={streamStatus}
      />
    </div>
  )
}
