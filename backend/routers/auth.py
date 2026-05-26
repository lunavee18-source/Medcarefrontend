from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from database import get_db
from models import User, Hospital

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    name: str
    phone: str
    email: str = None
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class HospitalRegister(BaseModel):
    name: str
    email: str
    password: str
    address: str
    phone: str
    city: str = "Tumkur"
    specializations: str
    emergency: bool = False
    description: str = ""

class HospitalLogin(BaseModel):
    email: str
    password: str

# ── USER AUTH ──
@router.post("/user/register")
def user_register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(400, "Phone already registered")
    user = User(name=data.name, phone=data.phone, email=data.email,
                password_hash=pwd.hash(data.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"message": "Registered successfully", "id": user.id, "name": user.name}

@router.post("/user/login")
def user_login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not pwd.verify(data.password, user.password_hash):
        raise HTTPException(401, "Invalid phone or password")
    return {"message": "Login successful", "id": user.id, "name": user.name, "phone": user.phone}

# ── HOSPITAL AUTH ──
@router.post("/hospital/register")
def hospital_register(data: HospitalRegister, db: Session = Depends(get_db)):
    if db.query(Hospital).filter(Hospital.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    h = Hospital(
        name=data.name, email=data.email, password_hash=pwd.hash(data.password),
        address=data.address, phone=data.phone, city=data.city,
        specializations=data.specializations, emergency=data.emergency,
        description=data.description
    )
    db.add(h); db.commit(); db.refresh(h)
    return {"message": "Hospital registered", "id": h.id, "name": h.name}

@router.post("/hospital/login")
def hospital_login(data: HospitalLogin, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.email == data.email).first()
    if not h or not pwd.verify(data.password, h.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"message": "Login successful", "id": h.id, "name": h.name, "email": h.email}