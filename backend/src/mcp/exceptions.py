"""MCP client exceptions."""


class UnsupportedResponseError(Exception):
    """Raised when the response from the server is unsupported."""

    def __init__(self, response_type: str) -> None:
        super().__init__(
            f"Response type '{response_type}' is not currently supported."
        )
