from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from backend.database import get_db
from backend.models import CalorieEntry

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

FOOD_DB = {
    "chapati": 120, "roti": 120, "dosa": 150, "idli": 60, "rice": 130,
    "dal": 180, "sambar": 80, "upma": 200, "poha": 250, "puri": 110,
    "paratha": 200, "biryani": 350, "paneer": 270, "egg": 80, "milk": 150,
    "bread": 80, "banana": 105, "apple": 80, "samosa": 150, "burger": 500,
    "chicken": 220, "fish": 150, "curd": 100, "oats": 300, "coffee": 50,
    "tea": 40, "juice": 120, "chocolate milkshake": 450, "veg sandwich": 250,
    "chole": 250, "rajma": 230, "dal rice": 310, "kheer": 250,
}

def estimate(text: str):
    text = text.lower()
    total = 0
    found = False
    words = text.split()
    for i in range(len(words)):
        for length in range(3, 0, -1):
            phrase = " ".join(words[i:i+length])
            if phrase in FOOD_DB:
                # Check for quantity before the phrase
                if i > 0 and words[i-1].isdigit():
                    total += int(words[i-1]) * FOOD_DB[phrase]
                else:
                    total += FOOD_DB[phrase]
                found = True
                break
    return max(total if found else 250, 30)

class NutritionIn(BaseModel):
    user_phone: str
    food_text: str

@router.post("/analyze")
def analyze(data: NutritionIn, db: Session = Depends(get_db)):
    kcal = estimate(data.food_text)
    entry = CalorieEntry(user_phone=data.user_phone, date=str(date.today()), label=data.food_text, kcal=kcal)
    db.add(entry)
    db.commit()
    return {"label": data.food_text, "kcal": kcal}

@router.get("/today")
def today_entries(phone: str, db: Session = Depends(get_db)):
    today = str(date.today())
    entries = db.query(CalorieEntry).filter(CalorieEntry.user_phone == phone, CalorieEntry.date == today).all()
    total = sum(e.kcal for e in entries)
    return {"entries": entries, "total_kcal": total}