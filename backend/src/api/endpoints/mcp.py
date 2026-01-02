"""MCP API endpoints."""

from typing import Annotated, Any

from fastapi import APIRouter, HTTPException
from fastapi.params import Body

from src.api.schemas import (
    ConnectRequest,
    ExecuteToolResponse,
    ToolInfo,
)
from src.mcp.client import (
    call_tool,
    get_connection_info,
    is_connected,
    list_tools,
)
from src.mcp.client import (
    connect as mcp_connect,
)
from src.mcp.client import disconnect as mcp_disconnect

router = APIRouter(prefix="/mcp", tags=["MCP Operations"])


@router.post("/connect")
async def connect(request: ConnectRequest):
    """Connect to MCP server (single active connection)."""

    success = await mcp_connect(
        command=request.command, args=request.args, env=request.env
    )

    if not success:
        raise HTTPException(
            status_code=500, detail="Failed to connect to MCP server"
        )

    return {
        "success": True,
        "message": "Connected",
        "info": get_connection_info(),
    }


@router.post("/disconnect")
async def disconnect():
    """Disconnect from MCP server."""

    success = await mcp_disconnect()
    return {"success": success}


@router.get("/status")
async def status():
    """Get connection status."""

    connected = is_connected()

    return {
        "connected": connected,
        "info": get_connection_info() if connected else None,
    }


@router.get("/list-tools", response_model=list[ToolInfo])
async def get_tools():
    """Get list of available tools."""

    if not is_connected():
        raise HTTPException(status_code=400, detail="No active connection")

    try:
        tools = await list_tools()
        return tools

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/execute", response_model=ExecuteToolResponse)
async def execute(
    tool_name: Annotated[str, Body(embed=True)],
    arguments: Annotated[dict[str, Any], Body(embed=True)],
):
    """Execute a tool."""

    if not is_connected():
        raise HTTPException(status_code=400, detail="No active connection")

    try:
        result = await call_tool(tool_name=tool_name, arguments=arguments)

        return ExecuteToolResponse(
            success=not result.get("isError", False),
            result=result.get("content"),
            error=None,
        )

    except Exception as e:
        return ExecuteToolResponse(success=False, result=None, error=str(e))
