"""Main module for the MCP Explorer."""

import logging

import uvicorn
from fastapi import FastAPI

from src.factory import create_fastapi
from src.utils.logging import setup_logging

app: FastAPI = create_fastapi()


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint returning basic API information."""

    return {"message": "MCP Explorer API", "version": "1.0.0"}


if __name__ == "__main__":
    setup_logging()
    logging.info("Starting MCP Explorer API...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_config=None)
