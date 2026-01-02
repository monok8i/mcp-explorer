"""MCP client for managing connections and tool calls."""

import logging
from contextlib import suppress
from typing import cast

from mcp.client.stdio import stdio_client
from mcp.types import TextContent

from mcp import ClientSession, StdioServerParameters

_current_session: ClientSession | None = None
_current_transport = None
_connection_info: dict[str, object] | None = None

logger = logging.getLogger(__name__)


async def connect(
    command: str, args: list[str], env: dict[str, str] | None = None
) -> bool:
    """Connect to MCP server via stdio."""

    global _current_session, _current_transport, _connection_info

    # Якщо вже підключені - відключаємось
    if _current_session:
        await disconnect()

    try:
        logger.info(f"Connecting to MCP server:  {command} {args}...")

        server_params = StdioServerParameters(
            command=command, args=args, env=env
        )

        _current_transport = stdio_client(server_params)

        read_stream, write_stream = await _current_transport.__aenter__()

        _current_session = ClientSession(read_stream, write_stream)
        await _current_session.__aenter__()

        # Ініціалізуємо
        await _current_session.initialize()

        _connection_info = {
            "command": command,
            "args": args,
            "status": "connected",
        }

        logger.info("Connected to MCP server.")
        return True

    except Exception as e:
        logger.error("Failed to connect to MCP server: %s", e, exc_info=True)
        _current_session = None
        _current_transport = None
        return False


async def disconnect() -> bool:
    """Disconnect from MCP server."""
    global _current_session, _current_transport, _connection_info

    if not _current_session:
        return False

    with suppress(Exception):
        await _current_session.__aexit__(None, None, None)

        if _current_transport:
            await _current_transport.__aexit__(None, None, None)

    _current_session = None
    _current_transport = None
    _connection_info = None

    print("🔌 Відключено")
    return True


def is_connected() -> bool:
    """Check if connected to MCP server."""
    return _current_session is not None


def get_connection_info() -> dict[str, object] | None:
    """Get information about the current connection."""
    return _connection_info


async def list_tools() -> list[dict[str, object]]:
    """List available tools."""
    if not _current_session:
        raise ValueError("No connection established")

    response = await _current_session.list_tools()

    return [
        {
            "name": tool.name,
            "description": tool.description,
            "input_schema": tool.inputSchema,
        }
        for tool in response.tools
    ]


async def call_tool(
    tool_name: str, arguments: dict[str, str] | None
) -> dict[str, object]:
    """Call a tool with the given arguments."""

    if not _current_session:
        raise ValueError("No connection established")

    logger.info(f"Calling tool '{tool_name}' with arguments: {arguments}")
    result = await _current_session.call_tool(tool_name, arguments=arguments)

    return {
        "content": [
            {"type": item.type, "text": item.text}
            for item in cast(list[TextContent], result.content)
        ],
        "isError": getattr(result, "isError", False),
    }
