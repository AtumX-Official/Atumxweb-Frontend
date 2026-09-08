"""Liveness check for the local backend."""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health():
    """Report that the backend process is up.

    Intentionally does not probe PlatformIO, esptool, serial ports or the
    ESP32 — those checks belong with the services that own them.
    """
    return {"status": "ok"}
