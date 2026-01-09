"""Connection type."""

from enum import Enum


class ConnectionType(Enum):
    STDIO = "stdio"
    SSE = "sse"
