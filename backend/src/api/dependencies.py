"""Dependencies for API endpoints."""

from typing import Annotated

from fastapi import Request, status
from fastapi.exceptions import HTTPException
from fastapi.params import Depends

from src.mcp.client.stdio import StdioMCPClient
from src.mcp.manager import ConnectionManager


def get_connection_id_from_header(request: Request) -> str:
    """Dependency to get the connection ID from request headers."""
    connection_id = request.headers.get("X-Connection-ID")

    if not connection_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Connection-ID header is required.",
        )

    return connection_id


def get_stdio_client(request: Request) -> StdioMCPClient:
    """Dependency to get the stdio MCP client."""
    manager: ConnectionManager = request.app.state.connection_manager

    return StdioMCPClient(manager)


GetStdioMCPClient = Annotated[StdioMCPClient, Depends(get_stdio_client)]
XConnectionID = Annotated[str, Depends(get_connection_id_from_header)]
