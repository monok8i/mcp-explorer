"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, CheckCircle, XCircle, Clock, Copy, Check } from "lucide-react"
import type { ExecutionResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ResultsPanelProps {
  results: ExecutionResult[]
  onClear: () => void
}

export function ResultsPanel({ results, onClear }: ResultsPanelProps) {
  return (
    <div className="flex w-96 flex-col rounded-2xl bg-card shadow-sm border border-border/50 overflow-hidden">
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

      <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const isError = result.result.isError

  const getContentText = () => {
    if (!result.result.content || result.result.content.length === 0) {
      return "No content returned"
    }
    return result.result.content.map((c) => (c.type === "text" ? c.text : JSON.stringify(c, null, 2))).join("\n")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getContentText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card
          className={cn(
            "cursor-pointer transition-all rounded-xl border-border/50 hover:shadow-md overflow-hidden",
            isError && "border-destructive/30 bg-destructive/5",
          )}
        >
          <CardHeader className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isError ? (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                  <CardTitle className="text-sm font-medium truncate">{result.toolName}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-6">{result.timestamp.toLocaleTimeString()}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-md text-xs font-medium shrink-0",
                  isError
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-green-500/10 text-green-600 border-green-500/20",
                )}
              >
                {isError ? "Error" : "Success"}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-2xl rounded-2xl max-h-[85vh] flex flex-col overflow-hidden"
        showCloseButton={true}
      >
        <DialogHeader className="pr-12 shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {isError ? (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
            <span className="truncate flex-1 text-left">{result.toolName}</span>
            <Badge
              variant="secondary"
              className={cn(
                "rounded-md text-xs font-medium shrink-0",
                isError
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-green-500/10 text-green-600 border-green-500/20",
              )}
            >
              {isError ? "Error" : "Success"}
            </Badge>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{result.timestamp.toLocaleString()}</p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full max-h-[calc(85vh-120px)]">
            <div className="space-y-4 pr-4">
              {/* Arguments */}
              {Object.keys(result.arguments).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Arguments</p>
                  <ScrollArea className="max-h-48">
                    <pre className="rounded-xl bg-muted p-3 text-xs font-mono break-all whitespace-pre-wrap overflow-hidden">
                      {JSON.stringify(result.arguments, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {/* Result Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Response</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs rounded-lg"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <ScrollArea className="max-h-[50vh]">
                  <pre
                    className={cn(
                      "rounded-xl p-3 text-xs font-mono whitespace-pre-wrap break-all overflow-hidden",
                      isError ? "bg-destructive/10 text-destructive" : "bg-muted",
                    )}
                  >
                    {getContentText()}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
