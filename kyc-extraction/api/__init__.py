from fastapi import APIRouter

from .ingest import router as ingest_router
from .extraction import router as extraction_router

router = APIRouter()

router.include_router(ingest_router, prefix="/ingest")
router.include_router(extraction_router, prefix="/extraction")
