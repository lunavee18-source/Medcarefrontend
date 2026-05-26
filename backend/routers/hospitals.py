from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Hospital, Doctor

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("/")
def get_all_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).filter(Hospital.is_active == True).all()
    result = []
    for h in hospitals:
        doctors = db.query(Doctor).filter(Doctor.hospital_id == h.id, Doctor.available == True).all()
        result.append({
            "id": h.id, "name": h.name, "address": h.address,
            "phone": h.phone, "city": h.city,
            "specializations": h.specializations.split(",") if h.specializations else [],
            "emergency": h.emergency, "description": h.description,
            "doctors": [{"id": d.id, "name": d.name, "specialty": d.specialty,
                         "experience": d.experience, "consultation_hours": d.consultation_hours} for d in doctors]
        })
    return result

@router.get("/{hospital_id}")
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h: raise HTTPException(404, "Hospital not found")
    doctors = db.query(Doctor).filter(Doctor.hospital_id == hospital_id).all()
    return {
        "id": h.id, "name": h.name, "address": h.address,
        "phone": h.phone, "city": h.city,
        "specializations": h.specializations.split(",") if h.specializations else [],
        "emergency": h.emergency, "description": h.description,
        "doctors": [{"id": d.id, "name": d.name, "specialty": d.specialty,
                     "experience": d.experience, "consultation_hours": d.consultation_hours,
                     "available": d.available} for d in doctors]
    }