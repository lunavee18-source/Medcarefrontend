from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from backend.config import GROQ_API_KEY, MODEL

router = APIRouter(prefix="/ai", tags=["AI"])
client = Groq(api_key=GROQ_API_KEY)

HOSPITALS_CONTEXT = """
Ganga Hospital (Orthopaedics, Spine, Neurology): Dr. Vijay Tubaki (Spine Surgeon, Mon-Sat 10AM-5PM), Dr. Ramesh Kumar (Neurologist, Tue/Thu/Sat 9AM-1PM), Dr. Pradeep Shetty (Orthopaedic, Mon/Wed/Fri 2PM-6PM)
Kasturba Hospital (OBG, Urology, ENT, ICU): Dr. Anita Rao (Gynaecologist, Mon-Sat 9AM-2PM), Dr. Suresh Nair (Urologist, Mon/Wed/Fri 3PM-7PM), Dr. Kavitha Murthy (ENT, Tue/Thu/Sat 10AM-3PM), Dr. Bhaskar Vittal (Intensivist, Mon-Sat 8AM-12PM)
Bharathi Hospital (General Surgery, Paediatrics): Dr. Priya Krishnamurthy (Child Specialist, Tue/Thu 10AM-2PM), Dr. Naveen Gowda (Surgeon, Mon-Sat 9AM-1PM)
District Govt Hospital (Emergency, TB, Dental): Dr. Manjunath N (General Physician, Mon-Sat 9AM-2PM), Dr. Ravi Desai (Dentist, Mon-Fri 10AM-4PM), Dr. Sneha Tiwari (TB Physician, Mon/Wed/Fri 9AM-12PM)
Shanthi Nursing Home (Cardiology, Paediatrics): Dr. Ramakrishna (Cardiologist, Mon/Wed/Fri 10AM-4PM), Dr. Lakshmi Narayana (Proctologist, Tue/Thu/Sat 9AM-1PM), Dr. Suma Murthy (Paediatrician, Mon-Sat 8AM-11AM)
"""

class ChatIn(BaseModel):
    message: str

@router.post("/chat")
def chat(data: ChatIn):
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"You are TumkurCare AI, a health assistant for Tumkur city, India. Recommend specific doctors from this list based on symptoms. Be concise and warm.\n\n{HOSPITALS_CONTEXT}"},
            {"role": "user", "content": data.message}
        ]
    )
    return {"reply": resp.choices[0].message.content}