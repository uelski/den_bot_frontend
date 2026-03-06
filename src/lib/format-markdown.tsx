import type { ReactNode } from "react"

const INLINE_PATTERN =
  /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_(.+?)_)|(\[(.+?)\]\((.+?)\))/g

export function formatInlineMarkdown(text: string): ReactNode[] {
  const elements: ReactNode[] = []
  let lastIndex = 0
  let keyIndex = 0
  let match: RegExpExecArray | null

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      elements.push(<strong key={keyIndex++}>{match[2]}</strong>)
    } else if (match[4]) {
      elements.push(<em key={keyIndex++}>{match[4]}</em>)
    } else if (match[6]) {
      elements.push(<em key={keyIndex++}>{match[6]}</em>)
    } else if (match[8] && match[9]) {
      elements.push(
        <a
          key={keyIndex++}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {match[8]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex))
  }

  return elements
}
