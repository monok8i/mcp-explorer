"""Connection implementation."""

from dataclasses import dataclass
from typing import Any

from mcp.client.session import ClientSession
from mcp.types import TextContent

from src.mcp.connection.config import (
    SSEConnectionConfig,
    StdioConnectionConfig,
)
from src.mcp.connection.type import ConnectionType
from src.mcp.exceptions import UnsupportedResponseError


@dataclass
class Connection:
    id: str
    name: str
    type: ConnectionType
    status: str
    config: SSEConnectionConfig | StdioConnectionConfig

    _session: ClientSession | None
    _transport: object

    @property
    def session(self) -> ClientSession | None:
        """Get the MCP client session."""
        return self._session

    @property
    def transport(self) -> object:
        """Get the transport object."""
        return self._transport

    def is_connected(self) -> bool:
        """Check if the connection is active."""
        return self._session is not None

    async def call_tool(
        self, tool_name: str, *args: Any, **kwargs: Any
    ) -> dict[str, list[dict[str, str]]]:
        """Call a tool on the MCP server."""
        if not self._session:
            raise RuntimeError("Connection is not established.")

        response = await self._session.call_tool(tool_name, *args, **kwargs)
        result: dict[str, list[dict[str, str]]] = {"content": []}

        for item in response.content:
            if not isinstance(item, TextContent):
                raise UnsupportedResponseError(item.__class__.__name__)

            result["content"].append({"type": item.type, "text": item.text})

        return result

    async def list_tools(self) -> list[dict[str, str | dict[str, Any] | None]]:
        """List available tools on the MCP server."""
        if not self._session:
            raise RuntimeError("Connection is not established.")

        response = await self._session.list_tools()
        result: list[dict[str, str | dict[str, Any] | None]] = []

        for tool in response.tools:
            result.append(
                {
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema,
                    "output_schema": tool.outputSchema,
                }
            )

        return result
