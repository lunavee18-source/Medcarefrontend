from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from backend.database import get_db
from backend.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterIn(BaseModel):
    name: str
    phone: str
    password: str

class LoginIn(BaseModel):
    phone: str
    password: str

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(400, "Phone already registered")
    user = User(name=data.name, phone=data.phone, password_hash=pwd.hash(data.password))
    db.add(user)
    db.commit()
    return {"message": "Registered successfully", "name": data.name}

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not pwd.verify(data.password, user.password_hash):
        raise HTTPException(401, "Invalid phone or password")
    return {"message": "Login successful", "name": user.name, "phone": user.phone}