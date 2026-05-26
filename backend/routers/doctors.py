from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Doctor, Hospital

router = APIRouter(prefix="/doctors", tags=["Doctors"])

class DoctorCreate(BaseModel):
    hospital_id: int
    name: str
    specialty: str
    experience: str
    consultation_hours: str

class DoctorUpdate(BaseModel):
    name: str = None
    specialty: str = None
    experience: str = None
    consultation_hours: str = None
    available: bool = None

@router.post("/")
def add_doctor(data: DoctorCreate, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == data.hospital_id).first()
    if not h: raise HTTPException(404, "Hospital not found")
    d = Doctor(**data.dict())
    db.add(d); db.commit(); db.refresh(d)
    return {"message": "Doctor added", "id": d.id}

@router.put("/{doctor_id}")
def update_doctor(doctor_id: int, data: DoctorUpdate, db: Session = Depends(get_db)):
    d = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not d: raise HTTPException(404, "Doctor not found")
    if data.name is not None: d.name = data.name
    if data.specialty is not None: d.specialty = data.specialty
    if data.experience is not None: d.experience = data.experience
    if data.consultation_hours is not None: d.consultation_hours = data.consultation_hours
    if data.available is not None: d.available = data.available
    db.commit()
    return {"message": "Updated"}

@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    d = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not d: raise HTTPException(404, "Not found")
    db.delete(d); db.commit()
    return {"message": "Deleted"}

@router.get("/hospital/{hospital_id}")
def get_hospital_doctors(hospital_id: int, db: Session = Depends(get_db)):
    doctors = db.query(Doctor).filter(Doctor.hospital_id == hospital_id).all()
    return [{"id": d.id, "name": d.name, "specialty": d.specialty,
             "experience": d.experience, "consultation_hours": d.consultation_hours,
             "available": d.available} for d in doctors]