import { test, expect } from "@playwright/test"

test.describe("About page — Knowledge base documents", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about")
  })

  test("renders the section with live-loaded docs from the mock API", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Knowledge base documents" })
    ).toBeVisible()

    // The mock returns 3 canned docs; assert one shows up with the
    // expected metadata + actions.
    await expect(page.getByText("2026 Budget Highlights")).toBeVisible({
      timeout: 5_000,
    })
    await expect(page.getByText(/18 pages/)).toBeVisible()

    // "View on denvergov.org" is present on entries with source_url.
    await expect(
      page.getByRole("link", { name: /View on denvergov\.org/i }).first()
    ).toBeVisible()

    // Every entry has its own Download button (one per doc, 3 in the mock).
    const downloads = page.getByRole("button", { name: /^Download / })
    await expect(downloads).toHaveCount(3)
  })
})
