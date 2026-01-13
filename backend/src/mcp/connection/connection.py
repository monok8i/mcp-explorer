"""Connection implementation."""

import asyncio
from contextlib import suppress
from dataclasses import dataclass, field
from typing import Any

from mcp.client.session import ClientSession
from mcp.types import TextContent

from mcp.client.stdio import StdioServerParameters, stdio_client
from src.mcp.connection.config import (
    SSEConnectionConfig,
    StdioConnectionConfig,
)
from src.mcp.connection.type import ConnectionType, ToolExecutionResultDict
from src.mcp.exceptions import UnsupportedResponseTypeError


@dataclass
class Connection:
    id: str
    name: str
    type: ConnectionType
    status: str
    config: SSEConnectionConfig | StdioConnectionConfig

    __session: ClientSession | None = field(init=False, default=None)
    __lifecycle_task: asyncio.Task[None] | None = field(
        init=False, default=None
    )
    __ready_event: asyncio.Event | None = field(init=False, default=None)
    __shutdown_event: asyncio.Event | None = field(init=False, default=None)

    @property
    def session(self) -> ClientSession | None:
        """Get the MCP client session."""
        return self.__session

    @session.setter
    def session(self, value: ClientSession | None) -> None:
        """Set the MCP client session."""
        self.__session = value

    def is_connected(self) -> bool:
        """Check if the connection is active."""
        return self.__session is not None

    async def initialize(self, server_params: StdioServerParameters) -> None:
        """Initialize the connection lifecycle in a dedicated task."""
        if self.__lifecycle_task:
            return

        self.__ready_event = asyncio.Event()
        self.__shutdown_event = asyncio.Event()
        self.__lifecycle_task = asyncio.create_task(
            self.__run_session(server_params)
        )

        await self.__ready_event.wait()

        if self.__lifecycle_task.done():
            exc = self.__lifecycle_task.exception()
            if exc is not None:
                raise exc

    async def cleanup(self) -> None:
        """Clean up the connection resources."""
        if self.__shutdown_event and not self.__shutdown_event.is_set():
            self.__shutdown_event.set()

        if self.__lifecycle_task:
            with suppress(Exception):
                await self.__lifecycle_task

        self.__lifecycle_task = None
        self.__ready_event = None
        self.__shutdown_event = None
        self.__session = None

    async def __run_session(
        self, server_params: StdioServerParameters
    ) -> None:
        """Run the stdio client and session inside a single task."""
        try:
            async with (
                stdio_client(server_params) as (
                    read_stream,
                    write_stream,
                ),
                ClientSession(read_stream, write_stream) as session,
            ):
                self.__session = session
                await session.initialize()

                if self.__ready_event and not self.__ready_event.is_set():
                    self.__ready_event.set()

                if self.__shutdown_event:
                    await self.__shutdown_event.wait()
        except Exception:
            if self.__ready_event and not self.__ready_event.is_set():
                self.__ready_event.set()
            raise
        finally:
            self.__session = None

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
