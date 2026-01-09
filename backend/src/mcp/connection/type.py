"""Connection type."""

from enum import Enum
from typing import TypedDict


class ConnectionType(Enum):
    STDIO = "stdio"
    SSE = "sse"


class ToolExecutionResultDict(TypedDict):
    content: list[dict[str, str]]
    isError: bool
