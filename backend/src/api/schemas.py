"""Pydantic models for MCP Explorer API."""

from pydantic import BaseModel, Field


class StdioConnectRequest(BaseModel):
    """Request to connect to MCP server."""

    name: str
    command: str
    args: list[str]
    env: dict[str, str] | None = None


class ToolInfo(BaseModel):
    """Information about a tool."""

    name: str
    description: str | None
    input_schema: dict[str, object] | None = Field(alias="inputSchema")

    class Config:
        """Pydantic configuration."""

        populate_by_name = True


class ExecuteToolRequest(BaseModel):
    """Request to execute a tool."""

    tool_name: str
    arguments: dict[str, str] | None


class ExecuteToolResponse(BaseModel):
    """Response after tool execution."""

    success: bool
    result: object | None
    error: str | None
