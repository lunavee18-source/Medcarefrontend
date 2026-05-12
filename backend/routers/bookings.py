from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Booking

router = APIRouter(prefix="/bookings", tags=["Bookings"])

class BookingIn(BaseModel):
    patient_name: str
    phone: str
    doctor_id: int
    doctor_name: str
    hospital_name: str
    time_slot: str
    date: str

@router.post("/")
def create_booking(data: BookingIn, db: Session = Depends(get_db)):
    b = Booking(**data.dict())
    db.add(b)
    db.commit()
    db.refresh(b)
    return {"message": "Booked!", "id": b.id}

@router.get("/")
def get_bookings(phone: str, db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.phone == phone).all()

@router.put("/{id}/cancel")
def cancel_booking(id: int, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == id).first()
    if not b:
        return {"error": "Not found"}
    b.status = "cancelled"
    db.commit()
    return {"message": "Cancelled"}