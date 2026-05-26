from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from config import GROQ_API_KEY, MODEL

router = APIRouter(prefix="/ai", tags=["AI"])

client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """
You are MedCare AI, an advanced healthcare assistant for patients in Tumkur, India.

Your responsibilities:
- Understand user symptoms carefully
- Explain possible causes in simple language
- Suggest safe home remedies
- Mention warning signs
- Recommend the correct specialist doctor
- Encourage booking appointments through MedCare

IMPORTANT RULES:
- NEVER diagnose with certainty
- ALWAYS say symptoms MAY indicate something
- ALWAYS provide remedies before recommending a doctor
- Keep responses concise and mobile-friendly
- Use emojis and sections
- Be warm, intelligent, and helpful
- If symptoms sound dangerous, strongly advise immediate medical attention

RESPONSE FORMAT:

## 🩺 Possible Cause
Explain what the symptoms may indicate in 2-4 short sentences.

## 💊 Home Remedies
Give 4-6 practical remedies in bullet points.

## ⚠️ Warning Signs
Mention danger signs that require immediate medical care.

## 👨‍⚕️ Recommended Specialist
Mention ONE doctor type clearly and explain why.

Examples:
- General Physician
- Cardiologist
- Neurologist
- ENT Specialist
- Orthopedic Doctor
- Dermatologist
- Gynecologist
- Pediatrician

## 🏥 Suggested Next Step
Encourage the user to book an appointment through the MedCare Hospitals section.

If the user is casually chatting and not asking medical questions, reply naturally and politely.
"""

class ChatMessage(BaseModel):
    message: str
    history: list = []


@router.post("/chat")
def chat(data: ChatMessage):

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # Add recent chat history
    for h in data.history[-6:]:
        if "role" in h and "content" in h:
            messages.append({
                "role": h["role"],
                "content": h["content"]
            })

    # Current user message
    messages.append({
        "role": "user",
        "content": data.message
    })

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=900,
            top_p=1
        )

        reply = response.choices[0].message.content

        if not reply:
            reply = "I'm unable to generate a response right now. Please try again."

    except Exception as e:
        reply = f"""## ⚠️ Connection Error

I'm having trouble connecting right now.

Error:
{str(e)}

Please try again in a moment."""

    return {
        "reply": reply
    }