import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { RtdAlertsCard } from "./RtdAlertsCard"

afterEach(() => {
  cleanup()
})

describe("RtdAlertsCard", () => {
  it("renders the total active alerts count", () => {
    render(
      <RtdAlertsCard
        alerts={{ totalActive: 49, alertsUrl: "https://app.rtd-denver.com/alerts" }}
      />
    )
    expect(screen.getByText("49")).toBeInTheDocument()
  })

  it("renders a link to the alerts page", () => {
    render(
      <RtdAlertsCard
        alerts={{ totalActive: 10, alertsUrl: "https://app.rtd-denver.com/alerts" }}
      />
    )
    const link = screen.getByRole("link", { name: /RTD Alerts/i })
    expect(link).toHaveAttribute("href", "https://app.rtd-denver.com/alerts")
    expect(link).toHaveAttribute("target", "_blank")
  })
})
