from fastapi import HTTPException, APIRouter
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from collections import defaultdict
from typing import List, Dict
import os
from datetime import datetime
import json

load_dotenv()

OpenAI.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI()

chat_router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

class InspirationTrip(BaseModel):
    origin: str
    destination: str

class DetailedTrip(BaseModel):
    origin: str
    destination: str
    start_date: str
    end_date: str

class InspirationProposal(BaseModel):
    price: float
    departure_date: str
    arrival_date: str

class InspirationBucket(BaseModel):
    label: str
    proposals: List[InspirationProposal]

class FlightSegment(BaseModel):
    airline: str
    departure_airport: str
    arrival_airport: str
    flight_time: int
    departure_time: str
    arrival_time: str
    flight_number: str
    stop_count: int

class Itinerary(BaseModel):
    price: float
    legs: List[FlightSegment]
    score: float

# list of conversation history
conversation_history = []

@chat_router.get("/")
async def get_chat():
    return {"conversation": conversation_history}

@chat_router.post("/start_inspiration_trip_convo")
async def start_inspiration_trip_convo(inspiration_trip : InspirationTrip, output_buckets : List[InspirationBucket]):
    
    print("we got here")
    trip_info = json.dumps([bucket.model_dump() for bucket in output_buckets])
    
    initial_prompt = (
        f"You are a helpful assistant helping the user. The user is looking for inspiration for a trip from {inspiration_trip.origin} to {inspiration_trip.destination}, and has been provided with the following options: "
        f"{trip_info}. Keep this context in mind when conversing with the user."
    )

    conversation_history.append({"role": "system", "content": initial_prompt})

    return {"message": "Conversation started successfully."}

@chat_router.post("/start_detailed_trip_convo")
async def start_detailed_trip_convo(detailed_trip : DetailedTrip, output_itineraries : List[Itinerary]):
    
    trip_info = json.dumps([itinerary.model_dump() for itinerary in output_itineraries])
    
    initial_prompt = (
        f"You are a helpful assistant helping the user. The user is planning a trip from {detailed_trip.origin} to {detailed_trip.destination} from {detailed_trip.start_date} till {detailed_trip.end_date} and has given you the following information: "
        f"{trip_info}. Keep this context in mind when conversing with the user."
    )

    conversation_history.append({"role": "system", "content": initial_prompt})

    return {"message": "Conversation started successfully."}

@chat_router.post("/conversation")
async def chat_with_gpt4(message: str):

    conversation_history.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation_history
        )
        gpt_response = response.choices[0].message['content']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

    conversation_history.append({"role": "assistant", "content": gpt_response})

    return {"response": gpt_response}

@chat_router.delete("/end_convo")
async def end_conversation():
    conversation_history.clear()
    return {"message": "Conversation ended successfully."}
