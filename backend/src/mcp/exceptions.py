"""MCP client exceptions."""


class UnsupportedResponseTypeError(Exception):
    """Raised when the response from the server is unsupported."""

    def __init__(self, response_type: str) -> None:
        super().__init__(
            f"Response type '{response_type}' is not currently supported."
        )


class UnsupportedConnectionTypeError(Exception):
    """Raised when the connection type is unsupported."""

    def __init__(self, connection_type: str) -> None:
        super().__init__(
            f"Connection type '{connection_type}' is not currently supported."
        )


class MCPClientNotConnectedError(Exception):
    """Raised when the MCP client is not connected to a server."""

    def __init__(self) -> None:
        super().__init__("MCP client is not connected to any server.")
