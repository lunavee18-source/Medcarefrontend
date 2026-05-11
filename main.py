from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers.ai import router as ai_router
from routers.bookings import router as bookings_router
from routers.health import router as health_router
from routers.reminders import router as reminders_router
from routers.nutrition import router as nutrition_router
from routers.auth import router as auth_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(ai_router)
app.include_router(bookings_router)
app.include_router(health_router)
app.include_router(reminders_router)
app.include_router(nutrition_router)
app.include_router(auth_router)

# Serve frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

@app.get("/api/status")
def status():
    return {"status": "MedCare Running"}