"""Stdio MCP client implementation."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from src.mcp.client.base import IMCPClient
from src.mcp.connection import StdioConnectionConfig
from src.mcp.connection.type import ConnectionType, ToolExecutionResultDict
from src.mcp.exceptions import MCPClientNotConnectedError

if TYPE_CHECKING:
    from src.mcp.connection.connection import Connection
    from src.mcp.manager import ConnectionManager


class StdioMCPClient(IMCPClient):
    def __init__(self, manager: ConnectionManager) -> None:
        self.manager = manager

    async def connect(
        self,
        name: str,
        command: str,
        args: list[str],
        **kwargs: Any,
    ) -> Connection:
        """Establish a connection to the MCP server."""

        env = kwargs.pop("env", None)
        config = StdioConnectionConfig(command=command, args=args, env=env)

        connection = await self.manager.create_connection(
            name, ConnectionType.STDIO, config
        )

        return connection

    def is_connected(self, connection_id: str) -> bool:
        """Check if the client is connected to the MCP server."""
        # Implementation for checking connection status
        return connection_id in self.manager.stdio_connections

    def get_connection_info(self, connection_id: str) -> Connection | None:
        """Retrieve information about the current connection."""
        # Implementation for retrieving connection info
        connection = self.manager.get_connection(connection_id)
        if not connection:
            return None

        return connection

    async def call_tool(
        self, connection_id: str, tool_name: str, *args: Any, **kwargs: Any
    ) -> ToolExecutionResultDict:
        """Call a specific tool on the MCP server with given arguments."""

        connection = self.manager.get_connection(connection_id)
        if not connection:
            raise MCPClientNotConnectedError()

        return await connection.call_tool(tool_name, *args, **kwargs)

    async def list_tools(
        self, connection_id: str
    ) -> list[dict[str, str | dict[str, Any] | None]]:
        """List all available tools on the MCP server."""
        # Implementation for listing tools
        connection = self.manager.get_connection(connection_id)
        if not connection:
            raise MCPClientNotConnectedError()

        return await connection.list_tools()

    async def disconnect(self, connection_id: str) -> dict[str, bool]:
        """Terminate the connection to the MCP server."""
        # Implementation for disconnecting
        return await self.manager.disconnect(connection_id)
