from fastapi import HTTPException, APIRouter
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from collections import defaultdict
from typing import List, Dict
import os

load_dotenv()

OpenAI.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI()

chat_router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

# maps from user_id to a list of conversation history
user_sessions = defaultdict(list)

class Message(BaseModel):
    user_id: str
    message: str

@chat_router.get("/")
async def get_chat(user_id: str):
    if user_id in user_sessions:
        return {"conversation": user_sessions[user_id]}
    else:
        raise HTTPException(status_code=404, detail="User ID not found in active sessions.")

@chat_router.post("/conversation")
async def chat_with_gpt4(message: Message):
    user_id = message.user_id
    user_input = message.message
    
    conversation_history = user_sessions[user_id]
    conversation_history.append({"role": "user", "content": user_input})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation_history
        )
        gpt_response = response.choices[0].message['content']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

    conversation_history.append({"role": "assistant", "content": gpt_response})
    user_sessions[user_id] = conversation_history

    return {"response": gpt_response}

async def parse_trip_info(trip_info: List[Dict]):
    trip_joined = ", ".join([f"{k}: {v}" for trip in trip_info for k, v in trip.items()])
    return trip_joined

@chat_router.post("/start_convo")
async def start_convo(user_id: str, trip_info: str):
    initial_prompt = (
        f"You are a helpful assistant helping the customer {user_id}. The user is planning a trip and has given you the following information: "
        f"{trip_info}. Keep this context in mind when conversing with the user."
    )

    conversation_history = [
        {"role": "system", "content": initial_prompt}
    ]

    user_sessions[user_id] = conversation_history

    return {"message": "Conversation started successfully."}

@chat_router.delete("/end_convo/{user_id}")
async def end_conversation(user_id: str):
    if user_id in user_sessions:
        del user_sessions[user_id]
        return {"message": "Conversation ended successfully."}
    else:
        raise HTTPException(status_code=404, detail="User ID not found in active sessions.")
