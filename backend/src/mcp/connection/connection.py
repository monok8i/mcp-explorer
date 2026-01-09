"""Connection implementation."""

from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass, field
from typing import Any

from anyio.streams.memory import (
    MemoryObjectReceiveStream,
    MemoryObjectSendStream,
)
from mcp.client.session import ClientSession
from mcp.shared.message import SessionMessage
from mcp.types import TextContent

from src.mcp.connection.config import (
    SSEConnectionConfig,
    StdioConnectionConfig,
)
from src.mcp.connection.type import ConnectionType, ToolExecutionResultDict
from src.mcp.exceptions import UnsupportedResponseTypeError

type Transport = AbstractAsyncContextManager[
    tuple[
        MemoryObjectReceiveStream[SessionMessage | Exception],
        MemoryObjectSendStream[SessionMessage],
    ]
]


@dataclass
class Connection:
    id: str
    name: str
    type: ConnectionType
    status: str
    config: SSEConnectionConfig | StdioConnectionConfig

    __session: ClientSession | None = field(init=False, default=None)
    __transport: Transport | None = field(init=False, default=None)

    @property
    def session(self) -> ClientSession | None:
        """Get the MCP client session."""
        return self.__session

    @session.setter
    def session(self, value: ClientSession | None) -> None:
        """Set the MCP client session."""
        self.__session = value

    @property
    def transport(
        self,
    ) -> Transport | None:
        """Get the transport object."""
        return self.__transport

    @transport.setter
    def transport(self, value: Transport | None) -> None:
        """Set the transport object."""
        self.__transport = value

    def is_connected(self) -> bool:
        """Check if the connection is active."""
        return self.__session is not None

    async def call_tool(
        self, tool_name: str, *args: Any, **kwargs: Any
    ) -> ToolExecutionResultDict:
        """Call a tool on the MCP server."""

        if not self.__session:
            raise RuntimeError("Connection is not established.")

        response = await self.__session.call_tool(tool_name, *args, **kwargs)
        result: ToolExecutionResultDict = {
            "content": [],
            "isError": False,
        }

        for item in response.content:
            if not isinstance(item, TextContent):
                raise UnsupportedResponseTypeError(item.__class__.__name__)

            result["content"].append({"type": item.type, "text": item.text})

        result["isError"] = getattr(response, "isError", False)

        return result

    async def list_tools(self) -> list[dict[str, str | dict[str, Any] | None]]:
        """List available tools on the MCP server."""
        if not self.__session:
            raise RuntimeError("Connection is not established.")

        response = await self.__session.list_tools()
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
