export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false"

export const STORAGE_KEYS = {
  CONVERSATIONS: "denver-bot-conversations",
} as const

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
