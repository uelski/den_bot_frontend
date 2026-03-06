import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bot, Database, Globe, Zap } from "lucide-react"

export function AboutContent() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        About Denver Data Bot
      </h2>
      <p className="mt-2 text-muted-foreground">
        An AI-powered assistant for querying Denver city data. Ask questions
        about population, neighborhoods, transit, parks, economy, and more.
      </p>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <Bot className="h-8 w-8 text-primary" />
            <CardTitle className="text-base">AI Agents</CardTitle>
            <CardDescription>
              Intelligent agents process your queries, selecting the best data
              sources and synthesizing comprehensive answers.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Database className="h-8 w-8 text-primary" />
            <CardTitle className="text-base">RAG Pipeline</CardTitle>
            <CardDescription>
              Retrieval-Augmented Generation ensures answers are grounded in
              real Denver data, not hallucinated.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Globe className="h-8 w-8 text-primary" />
            <CardTitle className="text-base">Web Crawling</CardTitle>
            <CardDescription>
              Automated crawlers gather up-to-date information from official
              Denver city sources and public datasets.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary" />
            <CardTitle className="text-base">Real-time Streaming</CardTitle>
            <CardDescription>
              Responses stream in real-time via SSE, so you see answers as
              they're generated — no waiting for the full response.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="text-sm text-muted-foreground">
        <p>
          Built with React, TypeScript, and Tailwind CSS. Powered by LLM
          agents on the backend.
        </p>
      </div>
    </div>
  )
}
