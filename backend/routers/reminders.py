from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Reminder

router = APIRouter(prefix="/reminders", tags=["Reminders"])

class ReminderIn(BaseModel):
    user_phone: str
    label: str
    time: str
    reminder_type: str  # water / medication

@router.get("/")
def get_reminders(phone: str, db: Session = Depends(get_db)):
    return db.query(Reminder).filter(Reminder.user_phone == phone).all()

@router.post("/")
def add_reminder(data: ReminderIn, db: Session = Depends(get_db)):
    r = Reminder(**data.dict())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

@router.put("/{id}/toggle")
def toggle_reminder(id: int, db: Session = Depends(get_db)):
    r = db.query(Reminder).filter(Reminder.id == id).first()
    if not r:
        return {"error": "Not found"}
    r.enabled = not r.enabled
    db.commit()
    return {"enabled": r.enabled}

@router.delete("/{id}")
def delete_reminder(id: int, db: Session = Depends(get_db)):
    r = db.query(Reminder).filter(Reminder.id == id).first()
    if r:
        db.delete(r)
        db.commit()
    return {"message": "Deleted"}