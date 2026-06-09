import { test, expect } from "@playwright/test"

test.describe("Blue Cypher smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test("send a message, see streamed response, reload from history", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Blue Cypher", level: 2 })
    ).toBeVisible()
    await expect(
      page.getByText(/Ask me anything about Denver/i)
    ).toBeVisible()

    const input = page.getByPlaceholder("Ask about Denver...")
    await input.fill("Tell me about Denver neighborhoods")
    await page.getByRole("button", { name: "Send message" }).click()

    await expect(
      page.getByText("Tell me about Denver neighborhoods")
    ).toBeVisible()

    await expect(page.getByText(/LoDo|RiNo|Capitol Hill/i).first()).toBeVisible(
      { timeout: 15_000 }
    )

    await expect(
      page.getByRole("button", { name: "Stop streaming" })
    ).toBeHidden({ timeout: 15_000 })

    // The mock response includes KB sources with document_ids, so the
    // "Knowledge base" subsection should render Download buttons per row.
    await expect(page.getByText("Knowledge base")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Download PDF" }).first()
    ).toBeVisible()

    await page.getByRole("link", { name: "History" }).click()
    await expect(page).toHaveURL(/\/history$/)

    const card = page
      .getByText("Tell me about Denver neighborhoods")
      .first()
    await expect(card).toBeVisible()
    await card.click()

    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByText("Tell me about Denver neighborhoods")
    ).toBeVisible()
    await expect(page.getByText(/LoDo|RiNo|Capitol Hill/i).first()).toBeVisible()
  })
})
