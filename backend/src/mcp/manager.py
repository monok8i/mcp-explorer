"""Connection manager for MCP client."""

import uuid
from contextlib import suppress
from dataclasses import asdict

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client
from src.mcp.connection import (
    Connection,
    SSEConnectionConfig,
    StdioConnectionConfig,
)
from src.mcp.connection.type import ConnectionType
from src.mcp.exceptions import UnsupportedConnectionTypeError


class ConnectionManager:
    def __init__(self) -> None:
        self._sse_connections: dict[str, Connection] = {}
        self._stdio_connections: dict[str, Connection] = {}

    @property
    def sse_connections(self) -> dict[str, Connection]:
        """Get all active SSE connections."""
        return self._sse_connections

    @property
    def stdio_connections(self) -> dict[str, Connection]:
        """Get all active Stdio connections."""
        return self._stdio_connections

    async def create_connection(
        self,
        name: str,
        type: ConnectionType,
        config: StdioConnectionConfig | SSEConnectionConfig,
    ) -> Connection:
        """Create a new connection based on the provided configuration."""
        connection_id = str(uuid.uuid4())

        match config:
            case StdioConnectionConfig():
                _transport = stdio_client(
                    StdioServerParameters(**asdict(config))
                )
                read_stream, write_stream = await _transport.__aenter__()
                _session = ClientSession(read_stream, write_stream)
                await _session.__aenter__()
                await _session.initialize()

                connection = Connection(
                    id=connection_id,
                    name=name,
                    status="connected",
                    type=ConnectionType.STDIO,
                    config=config,
                )
                connection.session = _session
                connection.transport = _transport
                self._stdio_connections[connection_id] = connection

            case SSEConnectionConfig():
                # Implement SSE connection creation logic here
                raise NotImplementedError(
                    "SSE connection not implemented yet."
                )

            case _:
                raise UnsupportedConnectionTypeError(
                    f"Unsupported connection config type: {type(config)}"
                )

        return connection

    def get_connection(self, connection_id: str) -> Connection | None:
        """Retrieve a connection by its ID."""
        return self._sse_connections.get(
            connection_id, None
        ) or self._stdio_connections.get(connection_id, None)

    async def disconnect(self, connection_id: str) -> dict[str, bool]:
        """Disconnect and remove a connection by its ID."""
        connection = self.get_connection(connection_id)
        if not connection:
            return {"success": True}

        if connection.type == ConnectionType.STDIO:
            with suppress(Exception):
                if connection.session:
                    await connection.session.__aexit__(None, None, None)

                    if connection.transport:
                        await connection.transport.__aexit__(None, None, None)

            del self._stdio_connections[connection_id]

        elif connection.type == ConnectionType.SSE:
            # Implement SSE disconnection logic here
            del self._sse_connections[connection_id]

        return {"success": True}
