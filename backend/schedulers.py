from apscheduler.schedulers.background import BackgroundScheduler
from backend.database import SessionLocal
from backend.models import Reminder
from backend.sms_service import send_sms

scheduler = BackgroundScheduler()

def check_and_send_reminders():
    from datetime import datetime
    now = datetime.now().strftime("%I:%M %p").lstrip("0")
    db = SessionLocal()
    reminders = db.query(Reminder).filter(Reminder.enabled == True).all()
    for r in reminders:
        if r.time == now:
            send_sms(r.user_phone, f"MedCare Reminder: {r.label} at {r.time}")
    db.close()

scheduler.add_job(check_and_send_reminders, "interval", minutes=1)

def start():
    scheduler.start()