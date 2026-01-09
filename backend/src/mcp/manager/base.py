"""Connection Manager Interface Definition."""

from typing import Protocol


class IConnectionManager(Protocol):
    def create_connection(self): ...
