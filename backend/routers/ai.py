from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from config import GROQ_API_KEY, MODEL

router = APIRouter(prefix="/ai", tags=["AI"])

client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """
You are MedCare AI, a smart and friendly medical assistant for users in India.

When users describe symptoms:

1. Briefly explain what the symptoms MAY indicate.
2. Suggest practical home remedies.
3. Mention warning signs requiring urgent care.
4. Recommend the correct specialist doctor.
5. Encourage booking an appointment through MedCare.

IMPORTANT RULES:
- Never give a final diagnosis.
- Never claim certainty.
- Never invent hospitals, addresses, links, or phone numbers.
- Be warm, natural, and conversational.
- Keep responses mobile-friendly and easy to read.
- Focus on helpful guidance, not fear.

Use this response structure:

## 🩺 Possible Cause
(short explanation)

## 💊 Home Remedies
• remedy
• remedy
• remedy

## ⚠️ Warning Signs
• sign
• sign

## 👨‍⚕️ Recommended Specialist
(short recommendation)

## 🏥 Suggested Next Step
(short action users should take)

- Do not make marketing claims or promises about the platform.
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