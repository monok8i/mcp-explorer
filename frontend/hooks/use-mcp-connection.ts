"use client"

import { useState, useCallback, useEffect } from "react"
import type { Connection, Tool, StdioConnectionConfig, ExecuteResult } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const STORAGE_KEY = "mcp_connection_id"

export function useMCPConnection() {
  const [connection, setConnection] = useState<Connection | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoadingTools, setIsLoadingTools] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Try to restore connection on mount
  useEffect(() => {
    const storedConnectionId = localStorage.getItem(STORAGE_KEY)
    if (storedConnectionId) {
      checkConnectionStatus(storedConnectionId)
    }
  }, [])

  const checkConnectionStatus = async (connectionId: string) => {
    try {
      const response = await fetch(`${API_BASE}/mcp/stdio/status`, {
        headers: { "X-Connection-ID": connectionId },
      })

      if (response.ok) {
        const data = await response.json()
        setConnection(data)
        await loadTools(connectionId)
      } else {
        // Connection no longer valid
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const loadTools = async (connectionId: string) => {
    setIsLoadingTools(true)
    try {
      const response = await fetch(`${API_BASE}/mcp/stdio/list-tools`, {
        headers: { "X-Connection-ID": connectionId },
      })

      if (!response.ok) {
        throw new Error("Failed to load tools")
      }

      const data = await response.json()
      setTools(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tools")
    } finally {
      setIsLoadingTools(false)
    }
  }

  const connect = useCallback(async (config: StdioConnectionConfig) => {
    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/mcp/stdio/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Connection failed")
      }

      const data: Connection = await response.json()
      setConnection(data)
      localStorage.setItem(STORAGE_KEY, data.id)

      // Load tools after successful connection
      await loadTools(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (!connection) return

    try {
      await fetch(`${API_BASE}/mcp/stdio/disconnect`, {
        method: "POST",
        headers: { "X-Connection-ID": connection.id },
      })
    } catch {
      // Ignore disconnect errors
    } finally {
      setConnection(null)
      setTools([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [connection])

  const executeTool = useCallback(
    async (toolName: string, args: Record<string, unknown>): Promise<ExecuteResult | null> => {
      if (!connection) {
        setError("Not connected")
        return null
      }

      try {
        const response = await fetch(`${API_BASE}/mcp/stdio/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Connection-ID": connection.id,
          },
          body: JSON.stringify({
            tool_name: toolName,
            arguments: args,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.detail || "Execution failed"
          // Return error as ExecuteResult instead of throwing
          return {
            content: [{ type: "text", text: errorMessage }],
            isError: true,
          }
        }

        return await response.json()
      } catch (err) {
        // Return error as ExecuteResult instead of setting error state
        const errorMessage = err instanceof Error ? err.message : "Execution failed"
        return {
          content: [{ type: "text", text: errorMessage }],
          isError: true,
        }
      }
    },
    [connection],
  )

  return {
    connection,
    tools,
    isConnecting,
    isLoadingTools,
    error,
    connect,
    disconnect,
    executeTool,
    clearError,
  }
}
