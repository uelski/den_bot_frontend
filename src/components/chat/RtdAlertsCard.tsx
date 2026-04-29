import { AlertTriangle, ExternalLink } from "lucide-react"
import type { RtdAlerts } from "@/types/chat"

interface RtdAlertsCardProps {
  alerts: RtdAlerts
}

export function RtdAlertsCard({ alerts }: RtdAlertsCardProps) {
  return (
    <div className="mt-3 rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span>
          Total active alerts: <span className="font-medium">{alerts.totalActive}</span>.
          {" "}View the full list at{" "}
          <a
            href={alerts.alertsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
          >
            RTD Alerts
            <ExternalLink className="h-3 w-3" />
          </a>
        </span>
      </div>
    </div>
  )
}
