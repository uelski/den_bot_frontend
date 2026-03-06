import { describe, it, expect } from "vitest"
import React from "react"
import { formatInlineMarkdown } from "./format-markdown"

// Helper: pull the type and props out of a ReactNode element for easy assertions
function el(node: React.ReactNode) {
  if (React.isValidElement(node)) {
    return { type: node.type, props: node.props }
  }
  return null
}

describe("formatInlineMarkdown", () => {
  it("returns plain text as a single string node", () => {
    const result = formatInlineMarkdown("hello world")
    expect(result).toHaveLength(1)
    expect(result[0]).toBe("hello world")
  })

  it("converts **bold** to a <strong> element", () => {
    const result = formatInlineMarkdown("**bold text**")
    expect(result).toHaveLength(1)
    expect(el(result[0])).toMatchObject({ type: "strong", props: { children: "bold text" } })
  })

  it("converts *italic* to an <em> element", () => {
    const result = formatInlineMarkdown("*italic text*")
    expect(result).toHaveLength(1)
    expect(el(result[0])).toMatchObject({ type: "em", props: { children: "italic text" } })
  })

  it("converts _italic_ to an <em> element", () => {
    const result = formatInlineMarkdown("_italic text_")
    expect(result).toHaveLength(1)
    expect(el(result[0])).toMatchObject({ type: "em", props: { children: "italic text" } })
  })

  it("converts [text](url) to an <a> element with correct href", () => {
    const result = formatInlineMarkdown("[Denver](https://denver.gov)")
    expect(result).toHaveLength(1)
    const element = el(result[0])
    expect(element?.type).toBe("a")
    expect(element?.props.href).toBe("https://denver.gov")
    expect(element?.props.children).toBe("Denver")
    expect(element?.props.target).toBe("_blank")
  })

  it("splits mixed content into the correct sequence of nodes", () => {
    const result = formatInlineMarkdown("Visit **Denver** today")
    // ["Visit ", <strong>Denver</strong>, " today"]
    expect(result).toHaveLength(3)
    expect(result[0]).toBe("Visit ")
    expect(el(result[1])).toMatchObject({ type: "strong", props: { children: "Denver" } })
    expect(result[2]).toBe(" today")
  })

  it("handles multiple inline elements in one string", () => {
    const result = formatInlineMarkdown("**bold** and *italic*")
    expect(result).toHaveLength(3)
    expect(el(result[0])).toMatchObject({ type: "strong" })
    expect(result[1]).toBe(" and ")
    expect(el(result[2])).toMatchObject({ type: "em" })
  })

  it("returns an empty array for an empty string", () => {
    const result = formatInlineMarkdown("")
    expect(result).toHaveLength(0)
  })
})
