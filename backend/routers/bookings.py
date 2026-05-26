from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Booking, Doctor, Hospital, User

router = APIRouter(prefix="/bookings", tags=["Bookings"])

class BookingCreate(BaseModel):
    user_id: int
    hospital_id: int
    doctor_id: int
    patient_name: str
    phone: str
    symptoms: str = ""
    date: str
    time_slot: str

class BookingAction(BaseModel):
    status: str  # approved / rejected
    rejection_reason: str = ""

@router.post("/")
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    b = Booking(**data.dict(), status="pending")
    db.add(b); db.commit(); db.refresh(b)
    return {"message": "Booking request sent!", "id": b.id}

@router.get("/user/{user_id}")
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.user_id == user_id).order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        result.append({
            "id": b.id,
            "patient_name": b.patient_name,
            "phone": b.phone,
            "symptoms": b.symptoms,
            "date": b.date,
            "time_slot": b.time_slot,
            "status": b.status,
            "rejection_reason": b.rejection_reason,
            "created_at": str(b.created_at),
            "doctor": {"name": b.doctor.name, "specialty": b.doctor.specialty} if b.doctor else {},
            "hospital": {"name": b.hospital.name, "address": b.hospital.address} if b.hospital else {},
        })
    return result

@router.get("/hospital/{hospital_id}")
def get_hospital_bookings(hospital_id: int, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.hospital_id == hospital_id).order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        result.append({
            "id": b.id,
            "patient_name": b.patient_name,
            "phone": b.phone,
            "symptoms": b.symptoms,
            "date": b.date,
            "time_slot": b.time_slot,
            "status": b.status,
            "rejection_reason": b.rejection_reason,
            "created_at": str(b.created_at),
            "doctor": {"id": b.doctor.id, "name": b.doctor.name, "specialty": b.doctor.specialty} if b.doctor else {},
        })
    return result

@router.put("/{booking_id}/action")
def booking_action(booking_id: int, data: BookingAction, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b: raise HTTPException(404, "Booking not found")
    if data.status not in ["approved", "rejected"]:
        raise HTTPException(400, "Status must be approved or rejected")
    b.status = data.status
    if data.rejection_reason: b.rejection_reason = data.rejection_reason
    db.commit()
    return {"message": f"Booking {data.status}"}

@router.put("/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b: raise HTTPException(404, "Not found")
    b.status = "cancelled"
    db.commit()
    return {"message": "Cancelled"}

@router.get("/hospital/{hospital_id}/stats")
def hospital_stats(hospital_id: int, db: Session = Depends(get_db)):
    all_b = db.query(Booking).filter(Booking.hospital_id == hospital_id).all()
    return {
        "total": len(all_b),
        "pending": len([b for b in all_b if b.status == "pending"]),
        "approved": len([b for b in all_b if b.status == "approved"]),
        "rejected": len([b for b in all_b if b.status == "rejected"]),
        "cancelled": len([b for b in all_b if b.status == "cancelled"]),
    }