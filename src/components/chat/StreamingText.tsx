import { InlineMarkdown } from "./InlineMarkdown"
import { LoadingIndicator } from "./LoadingIndicator"

interface StreamingTextProps {
  content: string
  isStreaming: boolean
}

export function StreamingText({ content, isStreaming }: StreamingTextProps) {
  if (isStreaming && !content) {
    return <LoadingIndicator />
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
