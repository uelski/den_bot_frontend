export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false"

export const STORAGE_KEYS = {
  CONVERSATIONS: "denver-bot-conversations",
} as const

// Hidden admin surface. The path ships in the public JS bundle, so it's
// obscurity only — the real gate is the server-side password.
export const ADMIN_PATH = "admin-sv"

// sessionStorage key for the admin password. sessionStorage (not localStorage)
// so closing the tab clears it; matches docs/admin-api.md.
export const ADMIN_PASSWORD_STORAGE_KEY = "admin_password"

// PDF upload category allowlist — must match the backend enum string-for-string.
// See docs/admin-api.md § Endpoint 2.
export const PDF_CATEGORIES = [
  "ordinance",
  "council",
  "budget",
  "finance",
  "transparency",
  "general",
] as const

export type PdfCategory = (typeof PDF_CATEGORIES)[number]

export const TOOL_LABELS: Record<string, string> = {
  get_neighborhood_weather: "Looking up weather…",
  get_rtd_service_alerts: "Checking RTD alerts…",
  get_rtd_next_arrivals: "Checking RTD arrivals…",
  get_rtd_vehicle_positions: "Tracking RTD vehicles…",
  search_denver_gov: "Searching denvergov.org website…",
}

export function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? "Using tool…"
}

export const FEEDBACK_CATEGORIES = [
  "Transportation",
  "Demographics",
  "Safety",
  "Housing",
  "Environment",
  "Other",
] as const

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]
