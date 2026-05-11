from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from database import get_db
from models import HealthLog

router = APIRouter(prefix="/health", tags=["Health"])

class HealthIn(BaseModel):
    user_phone: str
    steps: int = 0
    water_ml: float = 0
    calories: float = 0

@router.post("/log")
def log_health(data: HealthIn, db: Session = Depends(get_db)):
    today = str(date.today())
    log = db.query(HealthLog).filter(HealthLog.user_phone == data.user_phone, HealthLog.date == today).first()
    if log:
        log.steps = data.steps
        log.water_ml = data.water_ml
        log.calories = data.calories
    else:
        log = HealthLog(user_phone=data.user_phone, date=today, **data.dict(exclude={"user_phone"}))
        db.add(log)
    db.commit()
    return {"message": "Logged"}

@router.get("/today")
def today_health(phone: str, db: Session = Depends(get_db)):
    today = str(date.today())
    log = db.query(HealthLog).filter(HealthLog.user_phone == phone, HealthLog.date == today).first()
    if not log:
        return {"steps": 0, "water_ml": 0, "calories": 0}
    return log