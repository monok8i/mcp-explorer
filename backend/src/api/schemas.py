"""Pydantic models for MCP Explorer API."""

from pydantic import BaseModel, ConfigDict, Field

# STDIO SCHEMAS


class StdioConnectionRequestSchema(BaseModel):
    """Request to connect to MCP server."""

    name: str
    command: str
    args: list[str]
    env: dict[str, str] | None = None


class StdioConnectionConfigSchema(BaseModel):
    """Configuration for stdio connection."""

    command: str
    args: list[str]
    env: dict[str, str] | None = None

    model_config = ConfigDict(from_attributes=True)


class StdioConnectionInfoResponseSchema(BaseModel):
    """Information about the stdio connection."""

    id: str
    name: str
    type: str
    status: str
    config: StdioConnectionConfigSchema

    model_config = ConfigDict(from_attributes=True)


class StdioDisconnectResponseSchema(BaseModel):
    """Response after disconnecting from MCP server."""

    success: bool


# SSE SCHEMAS


class SSEConnectionConfigSchema(BaseModel):
    url: str
    headers: dict[str, str] | None = None


# TOOL SCHEMAS


class ToolInfoResponseSchema(BaseModel):
    """Information about a tool."""

    name: str
    description: str | None
    input_schema: dict[str, object] | None = Field(alias="inputSchema")
    output_schema: dict[str, object] | None = Field(alias="outputSchema")

    class Config:
        """Pydantic configuration."""

        populate_by_name = True


class ToolExecuteRequestSchema(BaseModel):
    """Request to execute a tool."""

    tool_name: str
    arguments: dict[str, str] | None


class ToolExecutionResponseSchema(BaseModel):
    """Response after tool execution."""

    content: object | None
    is_error: bool = Field(alias="isError")

    model_config = ConfigDict(populate_by_name=True)
