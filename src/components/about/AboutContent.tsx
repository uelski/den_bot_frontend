import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  Building2,
  Bug,
  Bus,
  Database,
  ExternalLink,
  Github,
  Lightbulb,
  MapPin,
  MessageCircle,
  MessageSquarePlus,
  Sparkles,
  TrainFront,
  Trees,
  Users,
} from "lucide-react"
import { UploadedDocsList } from "./UploadedDocsList"

const EXAMPLES = [
  {
    icon: Users,
    title: "Population & demographics",
    description:
      "Ask about Denver's population, growth, age, income, and how it varies across the city.",
    sample: "What's the population of Five Points?",
  },
  {
    icon: MapPin,
    title: "Neighborhoods",
    description:
      "Explore boundaries, character, and key facts about Denver's neighborhoods.",
    sample: "Tell me about the LoDo neighborhood.",
  },
  {
    icon: Bus,
    title: "Transit & RTD",
    description:
      "Routes, light rail, schedules, and current service alerts from RTD.",
    sample: "Are there any RTD alerts right now?",
  },
  {
    icon: Trees,
    title: "Parks & recreation",
    description:
      "City parks, trails, amenities, and recreation across Denver.",
    sample: "What parks are near Capitol Hill?",
  },
]

const DATA_SOURCES = [
  {
    icon: Database,
    name: "Denver Open Data Catalog",
    description:
      "Geospatial datasets covering neighborhoods, parks, infrastructure, and city services.",
    url: "https://opendata-geospatialdenver.hub.arcgis.com/",
  },
  {
    icon: TrainFront,
    name: "RTD Open Spatial Data",
    description:
      "Routes, stops, and schedules from the Regional Transportation District.",
    url: "https://www.rtd-denver.com/open-records/open-spatial-information",
  },
  {
    icon: Building2,
    name: "Denver City Government",
    description:
      "Official city services, announcements, and program information.",
    url: "https://denvergov.org/Home",
  },
]

interface TechLink {
  label: string
  url: string
  icon?: typeof Github
}

const FEEDBACK_TYPES = [
  {
    icon: Bug,
    title: "Bug",
    description:
      "Something broke or behaved unexpectedly — tell us what you were trying to do.",
  },
  {
    icon: Lightbulb,
    title: "Data source",
    description:
      "Know a Denver dataset Blue Cypher should pull from? Suggest it here.",
  },
  {
    icon: Sparkles,
    title: "Loading text",
    description:
      "Got a fun Denver-flavored loading phrase? We're collecting suggestions.",
  },
  {
    icon: MessageCircle,
    title: "General",
    description:
      "Anything else — ideas, observations, kind words, or complaints.",
  },
]

const TECH_LINKS: TechLink[] = [
  {
    label: "Frontend repo",
    url: "https://github.com/uelski/den_bot_frontend",
    icon: Github,
  },
  {
    label: "Backend repo",
    url: "https://github.com/uelski/den_bot_server",
    icon: Github,
  },
  { label: "FastAPI", url: "https://fastapi.tiangolo.com/" },
  { label: "Vite", url: "https://vite.dev/" },
  {
    label: "LangGraph",
    url: "https://docs.langchain.com/oss/python/langgraph/overview",
  },
]

export function AboutContent() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          About Blue Cypher
        </h2>
        <p className="mt-2 text-muted-foreground">
          An AI assistant for exploring Denver. Ask questions about
          neighborhoods, transit, parks, and city data — and get answers
          backed by official sources.
        </p>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold tracking-tight">
          What you can ask
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {EXAMPLES.map(({ icon: Icon, title, description, sample }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs italic text-muted-foreground">
                  “{sample}”
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold tracking-tight">
          Where the data comes from
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Blue Cypher pulls from public, official Denver-area sources. Tap a
          card to view the raw data.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {DATA_SOURCES.map(({ icon: Icon, name, description, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <Card className="transition-colors group-hover:bg-accent/50">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <Icon className="h-8 w-8 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-1.5 text-base">
                      <span>{name}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold tracking-tight">
          Knowledge base documents
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          PDFs ingested into Blue Cypher's knowledge base. View the original
          on denvergov.org, or download the exact copy Blue Cypher indexed —
          page citations in answers match it.
        </p>
        <UploadedDocsList />

        <Separator className="my-6" />

        <div className="flex gap-3 rounded-md border bg-muted/50 px-4 py-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">Blue Cypher is in active development.</p>
            <p className="mt-1 text-muted-foreground">
              AI can make mistakes. Verify anything important against the
              source links above before relying on it.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold tracking-tight">
          Help shape Blue Cypher
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the{" "}
          <span className="inline-flex h-5 w-5 translate-y-0.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MessageSquarePlus className="h-3 w-3" />
          </span>{" "}
          button in the corner of any screen to send feedback. We read all of
          it. Feedback is broken into four flavors so we can act on it faster:
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {FEEDBACK_TYPES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex gap-3 rounded-md border bg-card px-3 py-2.5"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-6" />

        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Built with</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {TECH_LINKS.map(({ label, url, icon: Icon }) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
