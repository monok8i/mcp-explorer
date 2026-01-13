"use client"

import { useState } from "react"
import { ConnectionSidebar } from "./connection-sidebar"
import { ToolsPanel } from "./tools-panel"
import { ResultsPanel } from "./results-panel"
import { useMCPConnection } from "@/hooks/use-mcp-connection"
import type { ExecutionResult } from "@/lib/types"

export function MCPExplorer() {
  const { connection, tools, isConnecting, isLoadingTools, error, connect, disconnect, executeTool, clearError } =
    useMCPConnection()

  const [results, setResults] = useState<ExecutionResult[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleExecute = async (toolName: string, args: Record<string, unknown>) => {
    if (!connection) return

    setIsExecuting(true)
    const result = await executeTool(toolName, args)
    setIsExecuting(false)

    if (result) {
      setResults((prev) => [
        {
          id: crypto.randomUUID(),
          toolName,
          arguments: args,
          result,
          timestamp: new Date(),
        },
        ...prev,
      ])
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    setResults([])
  }

  const clearResults = () => setResults([])

  return (
    <div className="flex h-screen bg-background p-4 gap-4">
      {/* Left Sidebar - Connections */}
      <ConnectionSidebar
        connection={connection}
        isConnecting={isConnecting}
        error={error}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onConnect={connect}
        onDisconnect={handleDisconnect}
        onClearError={clearError}
      />

      {/* Center Panel - Tools & Execution */}
      <ToolsPanel
        tools={tools}
        isLoading={isLoadingTools}
        isExecuting={isExecuting}
        isConnected={!!connection}
        onExecute={handleExecute}
      />

      {/* Right Panel - Results */}
      <ResultsPanel results={results} onClear={clearResults} />
    </div>
  )
}
