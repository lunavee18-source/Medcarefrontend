from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.sql import func
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    phone = Column(String)
    doctor_id = Column(Integer)
    doctor_name = Column(String)
    hospital_name = Column(String)
    time_slot = Column(String)
    date = Column(String)
    status = Column(String, default="booked")
    created_at = Column(DateTime, server_default=func.now())

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String)
    label = Column(String)
    time = Column(String)
    reminder_type = Column(String)  # water / medication
    enabled = Column(Boolean, default=True)

class HealthLog(Base):
    __tablename__ = "health_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String)
    date = Column(String)
    steps = Column(Integer, default=0)
    water_ml = Column(Float, default=0)
    calories = Column(Float, default=0)

class CalorieEntry(Base):
    __tablename__ = "calorie_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String)
    date = Column(String)
    label = Column(String)
    kcal = Column(Float)