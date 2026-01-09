"""Connection configurations."""

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass
class SSEConnectionConfig:
    url: str
    headers: dict[str, Any] | None = None
    timeout: float = 5
    sse_read_timeout: float = 60 * 5
    auth: httpx.Auth | None = None
    on_session_created: Callable[[str], None] | None = None


@dataclass
class StdioConnectionConfig:
    command: str
    args: list[str]
    env: dict[str, str] | None = None
