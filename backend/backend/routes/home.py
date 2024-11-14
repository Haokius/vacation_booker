from fastapi import HTTPException, APIRouter
from typing import List
from .chat import start_convo
from pydantic import BaseModel

home_router = APIRouter(
    prefix="/home",
    tags=["home"],
)

class Vacation(BaseModel):
    start_location: str
    end_location: str
    start_date: str
    end_date: str

def parse_trip_info(trip_info: List[Vacation]):
    trip_joined = "\n".join([f"{trip.start_location} to {trip.end_location} from {trip.start_date} to {trip.end_date}" for trip in trip_info])
    return trip_joined

@home_router.post("/")
async def search(user_id: str, vacation_plan: List[Vacation]):
    response = []
    try:
        for vacation in vacation_plan:
            # NOTE: query the APIs
            response.append(vacation.model_dump())

        # Convert vacation_plan to trip_info format
        trip_info = parse_trip_info(vacation_plan)
        
        # Call start_convo to initiate a conversation with the parsed trip information
        await start_convo(user_id=user_id, trip_info=trip_info)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")