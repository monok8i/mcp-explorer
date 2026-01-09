"""MCP Client Interface Definition."""

from typing import Any, Protocol

from src.mcp.manager import ConnectionManager


class IMCPClient(Protocol):
    manager: ConnectionManager

    async def connect(self, *args: Any, **kwargs: Any) -> Any:
        """Establish a connection to the MCP server."""
        ...

    def is_connected(self, *args: Any, **kwargs: Any) -> bool:
        """Check if the client is connected to the MCP server."""
        ...

    async def call_tool(
        self, connection_id: str, tool_name: str, *args: Any, **kwargs: Any
    ) -> Any:
        """Call a specific tool on the MCP server with given arguments."""
        ...

    async def list_tools(
        self, connection_id: str
    ) -> list[dict[str, str | dict[str, Any] | None]]:
        """List all available tools on the MCP server."""
        ...

    async def disconnect(self, connection_id: str) -> dict[str, bool]:
        """Terminate the connection to the MCP server."""
        ...
