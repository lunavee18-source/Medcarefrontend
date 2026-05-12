from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from backend.database import engine, Base
from backend.routers.ai import router as ai_router
from backend.routers.bookings import router as bookings_router
from backend.routers.health import router as health_router
from backend.routers.reminders import router as reminders_router
from backend.routers.nutrition import router as nutrition_router
from backend.routers.auth import router as auth_router

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


@app.get("/api/status")
def status():
    return {"status": "MedCare Running"}