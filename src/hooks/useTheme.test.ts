import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { renderHook, act, cleanup } from "@testing-library/react"
import { useTheme } from "./useTheme"

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("dark")
})

afterEach(() => {
  cleanup()
})

describe("useTheme", () => {
  it("defaults to dark theme", () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("dark")
  })

  it("reads stored theme from localStorage", () => {
    localStorage.setItem("den-bot-theme", "light")
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("light")
  })

  it("toggles theme from dark to light", () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe("light")
  })

  it("persists theme to localStorage on toggle", () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.toggleTheme()
    })
    expect(localStorage.getItem("den-bot-theme")).toBe("light")
  })
})
