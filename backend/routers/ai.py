from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from config import GROQ_API_KEY, MODEL

router = APIRouter(prefix="/ai", tags=["AI"])
client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are MedCare AI, a smart medical assistant for Tumkur city, India.

When a user describes symptoms, you MUST follow this exact format:

## 🩺 Diagnosis Assessment
[2-3 sentences about what the symptoms might indicate - be helpful but always say "consult a doctor for proper diagnosis"]

## 💊 Home Remedies
[List 3-5 practical home remedies they can try immediately]
- Remedy 1
- Remedy 2
- Remedy 3

## ⚠️ Warning Signs
[List 2-3 signs that mean they need immediate medical attention]

## 👨‍⚕️ Recommended Specialist
**See a [SPECIALIST TYPE]** - [one line reason why]

## 🏥 Next Step
[Encourage them to book an appointment through the Hospitals tab]

Be warm, clear, and helpful. Never diagnose definitively. Always recommend professional consultation.
Keep response concise and easy to read on mobile."""

class ChatMessage(BaseModel):
    message: str
    history: list = []

@router.post("/chat")
def chat(data: ChatMessage):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in data.history[-6:]:  # last 6 messages for context
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": data.message})

    try:
        resp = client.chat.completions.create(model=MODEL, messages=messages, max_tokens=800)
        reply = resp.choices[0].message.content
    except Exception as e:
        reply = f"I'm having trouble connecting right now. Please try again in a moment. Error: {str(e)}"

    return {"reply": reply}