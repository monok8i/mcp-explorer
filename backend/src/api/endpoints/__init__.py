from fastapi import APIRouter

from .stdio import router as stdio_router

router = APIRouter(prefix="/mcp", tags=["MCP Operations"])
router.include_router(stdio_router)
