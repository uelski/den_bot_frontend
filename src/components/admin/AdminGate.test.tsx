import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react"
import { AdminGate } from "./AdminGate"
import { AdminApiError } from "@/api/admin-types"

const validatePassword = vi.fn()

vi.mock("@/api/admin-api", () => ({
  adminApi: {
    validatePassword: (...args: unknown[]) => validatePassword(...args),
  },
}))

beforeEach(() => {
  validatePassword.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("AdminGate", () => {
  it("disables Unlock until a password is entered", () => {
    render(<AdminGate onUnlock={vi.fn()} />)
    const button = screen.getByRole("button", { name: /unlock/i })
    expect(button).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret" },
    })
    expect(button).not.toBeDisabled()
  })

  it("calls onUnlock with the password on success", async () => {
    validatePassword.mockResolvedValue(undefined)
    const onUnlock = vi.fn()
    render(<AdminGate onUnlock={onUnlock} />)
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "denver-dev" },
    })
    fireEvent.click(screen.getByRole("button", { name: /unlock/i }))
    await waitFor(() => {
      expect(onUnlock).toHaveBeenCalledWith("denver-dev")
    })
  })

  it("shows an incorrect-password message on 401", async () => {
    validatePassword.mockRejectedValue(new AdminApiError(401))
    const onUnlock = vi.fn()
    render(<AdminGate onUnlock={onUnlock} />)
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    })
    fireEvent.click(screen.getByRole("button", { name: /unlock/i }))
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/incorrect password/i)
    })
    expect(onUnlock).not.toHaveBeenCalled()
  })

  it("shows an unavailable message on 503", async () => {
    validatePassword.mockRejectedValue(new AdminApiError(503))
    render(<AdminGate onUnlock={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "x" },
    })
    fireEvent.click(screen.getByRole("button", { name: /unlock/i }))
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/unavailable/i)
    })
  })
})
