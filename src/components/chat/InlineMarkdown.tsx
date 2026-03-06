import { formatInlineMarkdown } from "@/lib/format-markdown"

interface InlineMarkdownProps {
  content: string
}

export function InlineMarkdown({ content }: InlineMarkdownProps) {
  const lines = content.split("\n")
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {formatInlineMarkdown(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}
