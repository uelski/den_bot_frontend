import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { AboutContent } from "./AboutContent"

afterEach(() => {
  cleanup()
})

describe("AboutContent", () => {
  it("renders the about heading", () => {
    render(<AboutContent />)
    expect(screen.getByText("About Blue Cypher")).toBeInTheDocument()
  })

  it("renders the four feature cards", () => {
    render(<AboutContent />)
    expect(screen.getByText("AI Agents")).toBeInTheDocument()
    expect(screen.getByText("RAG Pipeline")).toBeInTheDocument()
    expect(screen.getByText("Web Crawling")).toBeInTheDocument()
    expect(screen.getByText("Real-time Streaming")).toBeInTheDocument()
  })
})
