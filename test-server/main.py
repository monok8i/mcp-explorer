"""Simple MCP server example with three tools."""

import asyncio
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

from tools import AVAILABLE_TOOLS
from utils.logging import setup_logging

logger = setup_logging()

app = Server("test-server")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List of available tools."""

    return AVAILABLE_TOOLS


@app.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Call tool by name with arguments."""

    if name == "add":
        a = arguments["a"]
        b = arguments["b"]
        result = a + b
        return [
            TextContent(type="text", text=f"Результат: {a} + {b} = {result}")
        ]

    elif name == "greet":
        user_name = arguments["name"]
        return [TextContent(type="text", text=f"Привіт, {user_name}!  👋")]

    elif name == "multiply":
        a = arguments["a"]
        b = arguments["b"]
        result = a * b
        return [
            TextContent(type="text", text=f"Результат: {a} × {b} = {result}")
        ]

    else:
        raise ValueError(f"Unknown tool: {name}")


async def main():
    """Start server with stdio."""

    logger.info("Starting MCP server...")

    async with stdio_server() as (read_stream, write_stream):
        logger.info("MCP server is running.")
        await app.run(
            read_stream, write_stream, app.create_initialization_options()
        )
        logger.info("MCP server stopped.")


if __name__ == "__main__":
    asyncio.run(main())
