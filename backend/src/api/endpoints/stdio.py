"""MCP stdio API endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, HTTPException
from fastapi.params import Body

from src.api.dependencies import GetStdioMCPClient, XConnectionID
from src.api.schemas import (
    StdioConnectionInfoResponseSchema,
    StdioConnectionRequestSchema,
    StdioDisconnectResponseSchema,
    ToolExecutionResponseSchema,
    ToolInfoResponseSchema,
)

router = APIRouter(prefix="/stdio", tags=["MCP stdio Operations"])


@router.post(
    "/connect",
    response_model=StdioConnectionInfoResponseSchema,
    status_code=200,
)
async def connect(
    client: GetStdioMCPClient,
    request: StdioConnectionRequestSchema,
):
    """Connect to MCP server (single active connection)."""

    try:
        connection_info = await client.connect(
            name=request.name,
            command=request.command,
            args=request.args,
            env=request.env,
        )
        return StdioConnectionInfoResponseSchema.model_validate(
            connection_info, extra="ignore"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/disconnect", response_model=StdioDisconnectResponseSchema)
async def disconnect(connection_id: XConnectionID, client: GetStdioMCPClient):
    """Disconnect from MCP server."""

    try:
        return await client.disconnect(connection_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get(
    "/status",
    response_model=StdioConnectionInfoResponseSchema,
    status_code=200,
)
async def status(connection_id: XConnectionID, client: GetStdioMCPClient):
    """Get connection status."""

    connection_info = client.get_connection_info(connection_id)
    if not connection_info:
        raise HTTPException(
            status_code=404, detail="Connection not found. Please reconnect."
        )

    try:
        return StdioConnectionInfoResponseSchema.model_validate(
            connection_info, extra="ignore"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/list-tools", response_model=list[ToolInfoResponseSchema])
async def get_tools(connection_id: XConnectionID, client: GetStdioMCPClient):
    """Get list of available tools."""

    try:
        tools = await client.list_tools(connection_id)
        return [
            ToolInfoResponseSchema.model_validate(tool, extra="ignore")
            for tool in tools
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/execute", response_model=ToolExecutionResponseSchema)
async def execute(
    connection_id: XConnectionID,
    client: GetStdioMCPClient,
    tool_name: Annotated[str, Body(embed=True)],
    arguments: Annotated[dict[str, Any], Body(embed=True)],
):
    """Execute a tool."""

    try:
        return await client.call_tool(
            connection_id, tool_name=tool_name, arguments=arguments
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
