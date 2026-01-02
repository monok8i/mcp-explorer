"""Lifespan event handlers for FastAPI application."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def register_lifespan_events(app: FastAPI) -> AsyncGenerator[None]:
    """Register lifespan events for FastAPI application."""

    # Startup event
    ...

    yield

    # Shutdown event
    ...
