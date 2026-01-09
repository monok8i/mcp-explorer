"""MCP Client Interface Definition."""

from typing import Any, Protocol


class IMCPClient(Protocol):
    manager: IConnectionManager

    def connect(self) -> None:
        """Establish a connection to the MCP server."""
        ...

    def is_connected(self) -> bool:
        """Check if the client is connected to the MCP server."""
        ...

    def call_tool(
        self, tool_name: str, *args: Any, **kwargs: Any
    ) -> dict[str, str]:
        """Call a specific tool on the MCP server with given arguments."""
        ...

    def list_tools(self) -> list[dict[str, str]]:
        """List all available tools on the MCP server."""
        ...

    def disconnect(self) -> None:
        """Terminate the connection to the MCP server."""
        ...
