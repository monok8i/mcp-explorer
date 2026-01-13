export interface Connection {
  id: string
  name: string
  type: "stdio" | "sse"
  status: string
  config: StdioConfig
}

export interface StdioConfig {
  command: string
  args: string[]
  env: Record<string, string> | null
}

export interface StdioConnectionConfig {
  name: string
  command: string
  args: string[]
  env: Record<string, string>
}

export interface Tool {
  name: string
  description: string | null
  inputSchema: JSONSchema | null
  outputSchema: JSONSchema | null
}

export interface JSONSchema {
  type?: string
  properties?: Record<string, JSONSchema>
  required?: string[]
  description?: string
  default?: unknown
  items?: JSONSchema
  enum?: unknown[]
}

export interface ExecuteResult {
  content: ContentItem[]
  isError: boolean
}

export interface ContentItem {
  type: string
  text?: string
  [key: string]: unknown
}

export interface ExecutionResult {
  id: string
  toolName: string
  arguments: Record<string, unknown>
  result: ExecuteResult
  timestamp: Date
}
