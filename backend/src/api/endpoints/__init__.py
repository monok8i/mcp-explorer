from fastapi import APIRouter

from .stdio import router as stdio_router

router = APIRouter(prefix="/mcp")
router.include_router(stdio_router)
