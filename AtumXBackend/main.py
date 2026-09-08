"""
AtumX local backend.

Runs on the user's own machine, because the ESP32 is physically attached to it.
The Next.js frontend (http://localhost:3000) talks to this over HTTP, and later
over WebSocket for live build/upload logs.

This module is the foundation only: app setup, CORS and the health router.
Hardware work (PlatformIO, esptool, OTA, serial) is deliberately not here yet.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.health import router as health_router

# The Next.js dev server. Listed explicitly rather than using a wildcard so the
# local backend never accepts calls from an arbitrary page the user visits.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app = FastAPI(
    title="AtumX Backend",
    description="Local backend for the AtumX web IDE.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)


@app.get("/")
async def root():
    return {"success": True, "message": "AtumX Backend is running"}
