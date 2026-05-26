from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class BookingStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    bookings = relationship("Booking", back_populates="user")

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    address = Column(String)
    phone = Column(String)
    city = Column(String, default="Tumkur")
    specializations = Column(String)  # comma separated
    emergency = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    doctors = relationship("Doctor", back_populates="hospital")
    bookings = relationship("Booking", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    name = Column(String)
    specialty = Column(String)
    experience = Column(String)
    consultation_hours = Column(String)
    available = Column(Boolean, default=True)
    hospital = relationship("Hospital", back_populates="doctors")
    bookings = relationship("Booking", back_populates="doctor")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    patient_name = Column(String)
    phone = Column(String)
    symptoms = Column(Text, nullable=True)
    date = Column(String)
    time_slot = Column(String)
    status = Column(String, default="pending")
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="bookings")
    hospital = relationship("Hospital", back_populates="bookings")
    doctor = relationship("Doctor", back_populates="bookings")