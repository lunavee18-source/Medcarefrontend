from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, hospitals, bookings, ai_chat, doctors

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedCare API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(doctors.router)
app.include_router(bookings.router)
app.include_router(ai_chat.router)

@app.get("/")
def root():
    return {"status": "MedCare API v2 Running"}