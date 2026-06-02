import { describe, it, expect } from "vitest"
import { groupSources } from "./group-sources"
import { makeSource, makeKbSource } from "@/test/helpers"

describe("groupSources", () => {
  it("returns empty catalog, neighborhoodGroups, and knowledgeBase for empty input", () => {
    const result = groupSources([])
    expect(result.catalog).toEqual([])
    expect(result.neighborhoodGroups).toEqual([])
    expect(result.knowledgeBase).toEqual([])
  })

  it("puts non-neighborhood sources into catalog", () => {
    const sources = [
      makeSource({ service_name: "Denver Parks", hub_url: "https://hub.test" }),
      makeSource({ service_name: "Denver Zoning" }),
    ]
    const result = groupSources(sources)
    expect(result.catalog).toHaveLength(2)
    expect(result.neighborhoodGroups).toHaveLength(0)
  })

  it("groups neighborhood sources by service_name + hub_url", () => {
    const sources = [
      makeSource({
        service_name: "Demographics",
        hub_url: "https://hub.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "Capitol Hill",
      }),
      makeSource({
        service_name: "Demographics",
        hub_url: "https://hub.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "Five Points",
      }),
    ]
    const result = groupSources(sources)
    expect(result.catalog).toHaveLength(0)
    expect(result.neighborhoodGroups).toHaveLength(1)
    expect(result.neighborhoodGroups[0].neighborhoods).toEqual([
      "Capitol Hill",
      "Five Points",
    ])
  })

  it("deduplicates neighborhood names within a group", () => {
    const sources = [
      makeSource({
        service_name: "Demographics",
        hub_url: "https://hub.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "Capitol Hill",
      }),
      makeSource({
        service_name: "Demographics",
        hub_url: "https://hub.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "Capitol Hill",
      }),
    ]
    const result = groupSources(sources)
    expect(result.neighborhoodGroups[0].neighborhoods).toEqual(["Capitol Hill"])
  })

  it("sorts catalog with hub_url sources first", () => {
    const sources = [
      makeSource({ service_name: "Basic Only", base_url: "https://basic.test" }),
      makeSource({ service_name: "Hub Source", hub_url: "https://hub.test" }),
    ]
    const result = groupSources(sources)
    expect(result.catalog[0].service_name).toBe("Hub Source")
    expect(result.catalog[1].service_name).toBe("Basic Only")
  })

  it("correctly splits mixed catalog and neighborhood sources", () => {
    const sources = [
      makeSource({ service_name: "Denver Parks", hub_url: "https://parks.test" }),
      makeSource({
        service_name: "Demographics",
        hub_url: "https://hub.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "Globeville",
      }),
    ]
    const result = groupSources(sources)
    expect(result.catalog).toHaveLength(1)
    expect(result.catalog[0].service_name).toBe("Denver Parks")
    expect(result.neighborhoodGroups).toHaveLength(1)
    expect(result.neighborhoodGroups[0].neighborhoods).toEqual(["Globeville"])
  })

  it("falls back to base_url when hub_url is undefined for grouping key", () => {
    const sources = [
      makeSource({
        service_name: "Demographics",
        base_url: "https://base.test",
        hub_url: undefined,
        doc_type: "neighborhood_demographics",
        neighborhood_name: "RiNo",
      }),
    ]
    const result = groupSources(sources)
    expect(result.neighborhoodGroups[0].hub_url).toBe("https://base.test")
  })

  it("routes knowledge_base sources into the knowledgeBase bucket", () => {
    const sources = [
      makeSource({ service_name: "Denver Parks", hub_url: "https://hub.test" }),
      makeKbSource({
        document_title: "Denver Code of Ordinances",
        page_start: 11,
        page_end: 14,
      }),
      makeKbSource({ document_title: "Denver 2026 Budget" }),
    ]
    const result = groupSources(sources)
    expect(result.catalog).toHaveLength(1)
    expect(result.neighborhoodGroups).toHaveLength(0)
    expect(result.knowledgeBase).toHaveLength(2)
    expect(result.knowledgeBase[0].document_title).toBe(
      "Denver Code of Ordinances"
    )
  })

  it("treats source_collection values other than \"knowledge_base\" as legacy", () => {
    // Forward-compat: a future collection ID shouldn't accidentally land in KB.
    const sources = [
      makeSource({
        service_name: "Future Catalog",
        source_collection: "something_new",
      }),
    ]
    const result = groupSources(sources)
    expect(result.knowledgeBase).toHaveLength(0)
    expect(result.catalog).toHaveLength(1)
  })

  it("creates separate groups for different service_name + hub_url combos", () => {
    const sources = [
      makeSource({
        service_name: "Dataset A",
        hub_url: "https://a.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "LoDo",
      }),
      makeSource({
        service_name: "Dataset B",
        hub_url: "https://b.test",
        doc_type: "neighborhood_demographics",
        neighborhood_name: "LoDo",
      }),
    ]
    const result = groupSources(sources)
    expect(result.neighborhoodGroups).toHaveLength(2)
  })
})
