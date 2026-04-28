import { InlineMarkdown } from "./InlineMarkdown"
import { LoadingIndicator } from "./LoadingIndicator"
import { ToolCallIndicator } from "./ToolCallIndicator"

interface StreamingTextProps {
  content: string
  isStreaming: boolean
  toolCallLabel?: string
}

export function StreamingText({ content, isStreaming, toolCallLabel }: StreamingTextProps) {
  if (isStreaming && !content) {
    return (
      <div className="flex flex-col gap-1.5">
        <LoadingIndicator />
        {toolCallLabel && <ToolCallIndicator label={toolCallLabel} />}
      </div>
    )
  }

  return (
    <span>
      <InlineMarkdown content={content} />
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-foreground/70 align-middle" />
      )}
    </span>
  )
}
