import { describe, it, expect } from "vitest"
import { getMockResponse } from "./mock-responses"

describe("getMockResponse", () => {
  it("matches population keywords", () => {
    const result = getMockResponse("how many people live in Denver?")
    expect(result).toContain("715,522")
  })

  it("matches weather keywords", () => {
    expect(getMockResponse("what is the weather like?")).toContain("semi-arid")
    expect(getMockResponse("does it snow?")).toContain("snow")
    expect(getMockResponse("how sunny is Denver?")).toContain("300 days")
  })

  it("matches neighborhood keywords", () => {
    expect(getMockResponse("tell me about Denver neighborhoods")).toContain("78 official neighborhoods")
    expect(getMockResponse("what is LoDo like?")).toContain("LoDo")
    expect(getMockResponse("I want to visit RiNo")).toContain("RiNo")
  })

  it("matches park/outdoor keywords", () => {
    expect(getMockResponse("what parks are in Denver?")).toContain("200 parks")
    expect(getMockResponse("good hiking near Denver?")).toContain("Cherry Creek Trail")
  })

  it("matches transit keywords", () => {
    expect(getMockResponse("how do I take the bus?")).toContain("RTD")
    expect(getMockResponse("tell me about RTD trains")).toContain("Light rail")
  })

  it("matches food/dining keywords", () => {
    expect(getMockResponse("where should I eat in Denver?")).toContain("Napa Valley of Beer")
    expect(getMockResponse("best brewery in Denver?")).toContain("breweries")
  })

  it("matches economy/jobs keywords", () => {
    expect(getMockResponse("what jobs are in Denver?")).toContain("technology")
    expect(getMockResponse("tell me about the Denver tech scene")).toContain("tech hub")
  })

  it("matches history keywords", () => {
    expect(getMockResponse("when was Denver founded?")).toContain("1858")
    expect(getMockResponse("Denver gold rush history")).toContain("Gold Rush")
  })

  it("is case-insensitive", () => {
    expect(getMockResponse("POPULATION")).toContain("715,522")
    expect(getMockResponse("Weather")).toContain("semi-arid")
  })

  it("returns the default response for unrecognized queries", () => {
    const result = getMockResponse("what is 2 + 2?")
    expect(result).toContain("Mile High City")
  })

  it("returns the default response for an empty string", () => {
    const result = getMockResponse("")
    expect(result).toContain("Mile High City")
  })
})
