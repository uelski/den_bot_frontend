import { test, expect } from "@playwright/test"

// Mirrors MOCK_ADMIN_PASSWORD in src/api/mock/mock-admin-api.ts.
const DEV_PASSWORD = "denver-dev"

test.describe("Hidden admin — PDF upload (mock API)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin-sv")
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
  })

  test("gate rejects a wrong password", async ({ page }) => {
    await page.getByLabel(/password/i).fill("nope")
    await page.getByRole("button", { name: /unlock/i }).click()
    await expect(page.getByRole("alert")).toContainText(/incorrect/i)
  })

  test("unlock, pick a PDF, fill metadata, upload to success", async ({
    page,
  }) => {
    // Gate
    await page.getByLabel(/password/i).fill(DEV_PASSWORD)
    await page.getByRole("button", { name: /unlock/i }).click()

    // Upload form is now visible
    await expect(page.getByText("Upload PDF")).toBeVisible()

    // Attach a fake PDF — filename should prefill the "Original filename" field
    await page.getByLabel(/pdf file/i).setInputFiles({
      name: "denver-budget.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7 fake content"),
    })
    await expect(page.getByLabel(/original filename/i)).toHaveValue(
      "denver-budget.pdf"
    )

    // Fill remaining metadata (category defaults to the first allowlist value)
    await page.getByLabel(/document title/i).fill("Denver 2026 Budget")
    await page
      .getByLabel(/source url/i)
      .fill("https://denvergov.org/budget")

    // Upload → mock simulates progress → success
    await page.getByRole("button", { name: "Upload" }).click()
    await expect(page.getByText("Uploaded.")).toBeVisible({ timeout: 10_000 })
  })

  test("session persists across reload", async ({ page }) => {
    await page.getByLabel(/password/i).fill(DEV_PASSWORD)
    await page.getByRole("button", { name: /unlock/i }).click()
    await expect(page.getByText("Upload PDF")).toBeVisible()

    await page.reload()
    // Still unlocked — no password prompt
    await expect(page.getByText("Upload PDF")).toBeVisible()
    await expect(page.getByLabel(/password/i)).toHaveCount(0)
  })
})
