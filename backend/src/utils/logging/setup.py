"""Setup logging configuration for the application."""

import logging
import sys

from src.utils.logging.config import (
    DEFAULT_LOGGING_FORMAT,
    DEFAULT_LOGGING_LEVEL,
)


def setup_logging() -> logging.Logger:
    """Set up and configure logging for the application.

    Returns:
        logging.Logger: Configured root logger.
    """

    # Create a logger
    logger = logging.getLogger()
    logger.setLevel(level=DEFAULT_LOGGING_LEVEL)

    # Create console handler and set level to debug
    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(level=DEFAULT_LOGGING_LEVEL)

    # Create formatter
    formatter = logging.Formatter(DEFAULT_LOGGING_FORMAT)

    # Add formatter to console handler
    sh.setFormatter(formatter)

    # Add console handler to logger
    logger.addHandler(sh)

    # Configure FastAPI logger to propagate to root
    fastapi_logger = logging.getLogger("fastapi")
    uvicorn_logger = logging.getLogger("uvicorn")
    fastapi_logger.setLevel(level=DEFAULT_LOGGING_LEVEL)
    uvicorn_logger.setLevel(level=DEFAULT_LOGGING_LEVEL)
    fastapi_logger.propagate = True  # This is default, but explicit
    uvicorn_logger.propagate = True  # This is default, but explicit

    return logger
