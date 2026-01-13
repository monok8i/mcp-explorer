"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Plug, Unplug, RefreshCw, AlertCircle, X } from "lucide-react"
import type { Connection, StdioConnectionConfig } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ConnectionSidebarProps {
  connection: Connection | null
  isConnecting: boolean
  error: string | null
  collapsed: boolean
  onToggleCollapse: () => void
  onConnect: (config: StdioConnectionConfig) => Promise<void>
  onDisconnect: () => Promise<void>
  onClearError: () => void
}

export function ConnectionSidebar({
  connection,
  isConnecting,
  error,
  collapsed,
  onToggleCollapse,
  onConnect,
  onDisconnect,
  onClearError,
}: ConnectionSidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<StdioConnectionConfig>({
    name: "",
    command: "",
    args: [],
    env: {},
  })
  const [argsInput, setArgsInput] = useState("")
  const [envInput, setEnvInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const args = argsInput
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean)

    let env: Record<string, string> = {}
    try {
      if (envInput.trim()) {
        env = JSON.parse(envInput)
      }
    } catch {
      // Invalid JSON, use empty object
    }

    await onConnect({
      ...formData,
      args,
      env,
    })

    setIsDialogOpen(false)
  }

  const handleReconnect = async () => {
    if (connection) {
      const config: StdioConnectionConfig = {
        name: connection.name,
        command: connection.config.command,
        args: connection.config.args,
        env: connection.config.env || {},
      }
      await onDisconnect()
      await onConnect(config)
      setDetailsDialogOpen(false)
    }
  }

  const handleDisconnect = async () => {
    await onDisconnect()
    setDetailsDialogOpen(false)
  }

  if (collapsed) {
    return (
      <div className="flex w-16 flex-col rounded-2xl bg-card shadow-soft">
        <div className="flex h-14 items-center justify-center">
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-3 p-3">
          <div
            className={cn(
              "h-3 w-3 rounded-full transition-colors",
              connection ? "bg-success" : "bg-muted-foreground/30",
            )}
            title={connection ? "Connected" : "Disconnected"}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-72 flex-col rounded-2xl bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
        <h2 className="font-semibold text-foreground">Connections</h2>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="rounded-xl">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Create Connection Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full rounded-xl" disabled={!!connection}>
                <Plus className="mr-2 h-4 w-4" />
                Create Connection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create STDIO Connection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Connection Name</Label>
                  <Input
                    id="name"
                    placeholder="my-mcp-server"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="command">Command</Label>
                  <Input
                    id="command"
                    placeholder="python"
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="args">Arguments (one per line)</Label>
                  <Textarea
                    id="args"
                    placeholder={"-m\nmy_mcp_server"}
                    value={argsInput}
                    onChange={(e) => setArgsInput(e.target.value)}
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env">Environment Variables (JSON)</Label>
                  <Textarea
                    id="env"
                    placeholder='{"API_KEY": "value"}'
                    value={envInput}
                    onChange={(e) => setEnvInput(e.target.value)}
                    rows={2}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plug className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 rounded-xl">
              <CardContent className="flex items-start gap-2 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive flex-1">{error}</p>
                <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 rounded-lg" onClick={onClearError}>
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Connection Card */}
          {connection && (
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-all hover:shadow-soft-lg rounded-xl border-border/50">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{connection.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-muted-foreground">Connected</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span>{connection.name}</span>
                    <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="space-y-4 pb-4">
                    {/* Connection Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">{connection.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Command</span>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">
                          {connection.config.command}
                        </span>
                      </div>
                      {connection.config.args.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Args</span>
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">
                            {connection.config.args.join(" ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Raw JSON */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Raw JSON</p>
                      <pre className="overflow-auto rounded-lg bg-muted p-3 font-mono text-xs max-h-64">
                        {JSON.stringify(connection, null, 2)}
                      </pre>
                    </div>
                  </div>
                </ScrollArea>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg bg-transparent"
                    onClick={handleReconnect}
                    disabled={isConnecting}
                  >
                    <RefreshCw className={cn("mr-1.5 h-3 w-3", isConnecting && "animate-spin")} />
                    Reconnect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 bg-transparent"
                    onClick={handleDisconnect}
                  >
                    <Unplug className="mr-1.5 h-3 w-3" />
                    Disconnect
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Empty State */}
          {!connection && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Plug className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">No active connection</p>
              <p className="text-xs mt-1 text-muted-foreground/70">Create a connection to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status Footer */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              connection ? "bg-success" : "bg-muted-foreground/30",
            )}
          />
          <span>Status:</span>
          <span className={cn("font-medium", connection ? "text-success" : "text-muted-foreground")}>
            {connection ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  )
}
