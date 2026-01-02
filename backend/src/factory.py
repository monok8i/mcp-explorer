"""Factory for FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.endpoints import router as api_router
from src.lifespan import register_lifespan_events


def create_fastapi() -> FastAPI:
    """Create and configure FastAPI application."""

    app = FastAPI(lifespan=register_lifespan_events)
    app.include_router(api_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app
