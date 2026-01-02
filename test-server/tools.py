"""Defines available tools for the MCP server."""

from typing import Final

from mcp import Tool

AVAILABLE_TOOLS: Final[list[Tool]] = [
    Tool(
        name="add",
        description="Adds two numbers",
        inputSchema={
            "type": "object",
            "properties": {
                "a": {"type": "number", "description": "First number"},
                "b": {"type": "number", "description": "Second number"},
            },
            "required": ["a", "b"],
        },
    ),
    Tool(
        name="greet",
        description="Greets the user",
        inputSchema={
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "User's name",
                }
            },
            "required": ["name"],
        },
    ),
    Tool(
        name="multiply",
        description="Multiplies two numbers",
        inputSchema={
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"},
            },
            "required": ["a", "b"],
        },
    ),
]
