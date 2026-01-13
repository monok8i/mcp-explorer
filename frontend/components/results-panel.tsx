"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Trash2, ChevronDown, CheckCircle, XCircle, Clock } from "lucide-react"
import type { ExecutionResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ResultsPanelProps {
  results: ExecutionResult[]
  onClear: () => void
}

export function ResultsPanel({ results, onClear }: ResultsPanelProps) {
  return (
    <div className="flex w-96 flex-col rounded-2xl bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">Results</h2>
          {results.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{results.length}</span>
          )}
        </div>
        {results.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">No execution results yet</p>
              <p className="text-xs mt-1 text-muted-foreground/70">Execute a tool to see results here</p>
            </div>
          ) : (
            results.map((result) => <ResultCard key={result.id} result={result} />)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface ResultCardProps {
  result: ExecutionResult
}

function ResultCard({ result }: ResultCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isError = result.result.isError

  const getContentText = () => {
    if (!result.result.content || result.result.content.length === 0) {
      return "No content returned"
    }
    return result.result.content.map((c) => (c.type === "text" ? c.text : JSON.stringify(c))).join("\n")
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className={cn(
          "transition-all rounded-xl border-border/50",
          isError && "border-destructive/30 bg-destructive/5",
          isOpen && "shadow-soft",
        )}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer p-4 hover:bg-accent/30 rounded-t-xl transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isError ? (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  )}
                  <CardTitle className="text-sm font-medium truncate">{result.toolName}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-6">{result.timestamp.toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-md text-xs font-medium",
                    isError
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-success/10 text-success border-success/20",
                  )}
                >
                  {isError ? "Error" : "Success"}
                </Badge>
                <ChevronDown
                  className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Arguments */}
            {Object.keys(result.arguments).length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Arguments</p>
                <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs font-mono">
                  {JSON.stringify(result.arguments, null, 2)}
                </pre>
              </div>
            )}

            {/* Result Content */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Response</p>
              <pre
                className={cn(
                  "overflow-auto rounded-lg p-3 text-xs font-mono whitespace-pre-wrap",
                  isError ? "bg-destructive/10 text-destructive" : "bg-muted",
                )}
              >
                {getContentText()}
              </pre>
            </div>

            {/* Raw JSON */}
            <details className="text-xs group">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium">
                View Raw Response
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-muted p-3 font-mono">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
