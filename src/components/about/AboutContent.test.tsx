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

  it("renders the example-question categories", () => {
    render(<AboutContent />)
    expect(screen.getByText("Population & demographics")).toBeInTheDocument()
    expect(screen.getByText("Neighborhoods")).toBeInTheDocument()
    expect(screen.getByText("Transit & RTD")).toBeInTheDocument()
    expect(screen.getByText("Parks & recreation")).toBeInTheDocument()
  })

  it("renders the data source links", () => {
    render(<AboutContent />)
    expect(screen.getByText("Denver Open Data Catalog")).toBeInTheDocument()
    expect(screen.getByText("RTD Open Spatial Data")).toBeInTheDocument()
    expect(screen.getByText("Denver City Government")).toBeInTheDocument()
  })

  it("renders the tech stack footer links", () => {
    render(<AboutContent />)
    expect(screen.getByText("Frontend repo")).toBeInTheDocument()
    expect(screen.getByText("Backend repo")).toBeInTheDocument()
  })
})
