"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Play, Loader2, Wrench, ChevronRight } from "lucide-react"
import type { Tool, JSONSchema } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ToolsPanelProps {
  tools: Tool[]
  isLoading: boolean
  isExecuting: boolean
  isConnected: boolean
  onExecute: (toolName: string, args: Record<string, unknown>) => Promise<void>
}

export function ToolsPanel({ tools, isLoading, isExecuting, isConnected, onExecute }: ToolsPanelProps) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool)
    setFormValues({})
  }

  const handleExecute = async () => {
    if (!selectedTool) return
    await onExecute(selectedTool.name, formValues)
  }

  const handleValueChange = (key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col rounded-2xl bg-card shadow-soft overflow-hidden">
        <div className="flex h-14 items-center px-5 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Tools</h2>
        </div>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 opacity-30" />
            </div>
            <p className="font-medium">Connect to an MCP server</p>
            <p className="text-sm mt-1 text-muted-foreground/70">to see available tools</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col rounded-2xl bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center px-5 border-b border-border/50">
        <h2 className="font-semibold text-foreground">Tools</h2>
        {tools.length > 0 && (
          <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {tools.length} available
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tools List */}
        <div className="w-72 border-r border-border/50">
          <ScrollArea className="h-full">
            <div className="p-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tools.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No tools available</div>
              ) : (
                <div className="space-y-1">
                  {tools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => handleToolSelect(tool)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-left transition-all",
                        "hover:bg-accent/50",
                        selectedTool?.name === tool.name && "bg-accent shadow-soft",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{tool.name}</span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            selectedTool?.name === tool.name && "translate-x-0.5",
                          )}
                        />
                      </div>
                      {tool.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Tool Form */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              {selectedTool ? (
                <Card className="rounded-xl border-border/50 shadow-soft">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{selectedTool.name}</CardTitle>
                    {selectedTool.description && (
                      <CardDescription className="text-sm">{selectedTool.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Dynamic Form */}
                    <DynamicForm schema={selectedTool.inputSchema} values={formValues} onChange={handleValueChange} />

                    <div className="pt-2">
                      <Button onClick={handleExecute} disabled={isExecuting} className="w-full rounded-xl h-11">
                        {isExecuting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Execute Tool
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground min-h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <Wrench className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Select a tool to execute</p>
                    <p className="text-xs mt-1 text-muted-foreground/70">Choose from the list on the left</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

interface DynamicFormProps {
  schema: JSONSchema | null
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

function DynamicForm({ schema, values, onChange }: DynamicFormProps) {
  if (!schema || !schema.properties) {
    return (
      <div className="text-center py-6 text-muted-foreground rounded-xl bg-muted/50">
        <p className="text-sm">No parameters required for this tool.</p>
      </div>
    )
  }

  const properties = schema.properties as Record<string, JSONSchema>
  const required = schema.required || []

  return (
    <div className="space-y-5">
      {Object.entries(properties).map(([key, propSchema]) => {
        const isRequired = required.includes(key)
        const type = propSchema.type || "string"

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2 text-sm">
              {key}
              {isRequired ? (
                <span className="text-destructive text-xs">*</span>
              ) : (
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              )}
            </Label>
            {propSchema.description && <p className="text-xs text-muted-foreground">{propSchema.description}</p>}
            <FieldInput
              id={key}
              type={type}
              value={values[key]}
              onChange={(value) => onChange(key, value)}
              schema={propSchema}
            />
          </div>
        )
      })}
    </div>
  )
}

interface FieldInputProps {
  id: string
  type: string
  value: unknown
  onChange: (value: unknown) => void
  schema: JSONSchema
}

function FieldInput({ id, type, value, onChange, schema }: FieldInputProps) {
  switch (type) {
    case "boolean":
      return (
        <div className="flex items-center space-x-3 py-1">
          <Switch id={id} checked={!!value} onCheckedChange={(checked) => onChange(checked)} />
          <Label htmlFor={id} className="text-sm text-muted-foreground font-normal">
            {value ? "true" : "false"}
          </Label>
        </div>
      )

    case "number":
    case "integer":
      return (
        <Input
          id={id}
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder={schema.default?.toString() || `Enter ${id}`}
          className="rounded-xl"
        />
      )

    case "array":
    case "object":
      return (
        <Textarea
          id={id}
          value={typeof value === "string" ? value : JSON.stringify(value, null, 2) || ""}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch {
              onChange(e.target.value)
            }
          }}
          placeholder={type === "array" ? '["item1", "item2"]' : '{"key": "value"}'}
          rows={3}
          className="font-mono text-sm rounded-xl"
        />
      )

    default:
      return (
        <Input
          id={id}
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={schema.default?.toString() || `Enter ${id}`}
          className="rounded-xl"
        />
      )
  }
}
