from datetime import datetime
from typing import List

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
import requests

home_router = APIRouter(
    prefix="/home",
    tags=["home"],
)

#for inputs
class InspirationTrip(BaseModel):
    origin: str
    destination: str

class DetailedTrip(BaseModel):
    origin: str
    destination: str
    start_date: datetime
    end_date: datetime

#for outputs
class FlightSegment(BaseModel):
    airline: str
    departure_airport: str
    arrival_airport: str
    flight_time: int
    departure_time: datetime
    arrival_time: datetime

class Itinerary(BaseModel):
    price: int
    legs: List[FlightSegment]
    score: int

class InspirationProposal(BaseModel):
    price: int
    departure_date: datetime
    arrival_date: datetime

class InspirationBucket(BaseModel):
    label: str
    proposals: List[InspirationProposal]


@home_router.get("/get_inspiration")
async def get_inspiration(inspiration_trip: InspirationTrip) -> List[InspirationBucket]:
    API_KEY_DO_NOT_COMMIT = "056a930a84mshf1c29284b5dc849p1c5dabjsn3962e9ea1b58"

    origin = inspiration_trip.origin
    destination = inspiration_trip.destination

    url = f"https://sky-scanner3.p.rapidapi.com/flights/search-roundtrip?fromEntityId={origin}&toEntityId={destination}"
    r = requests.get(url, headers={
        "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
        "x-rapidapi-key": API_KEY_DO_NOT_COMMIT
    })

    if r.status_code != 200:
        print("something went wrong")

    response_json = r.json()

    print(r.json())

    buckets = response_json["data"]["flightQuotes"]["buckets"]
    results = response_json["data"]["flightQuotes"]["results"]

    output_buckets = []
    for bucket in buckets:
        label = bucket["label"]
        proposals = []

        result_ids = bucket["resultIds"]
        for id in result_ids:
            for result in results:
                if result["id"] == id:
                    result_content = result["content"]
                    price = result_content["rawPrice"]

                    outbound_date_str = result_content["outboundLeg"]["localDepartureDate"]
                    outbound_date = datetime.strptime(outbound_date_str, "%Y-%m-%d")

                    inbound_date_str = result_content["inboundLeg"]["localDepartureDate"]
                    inbound_date = datetime.strptime(inbound_date_str, "%Y-%m-%d")

                    proposals.append(InspirationProposal(price=price, departure_date=outbound_date, arrival_date=inbound_date))
        
        output_buckets.append(InspirationBucket(label=label, proposals=proposals))

    return output_buckets

@home_router.get("/get_detailed_trip")
async def get_detailed_trip(detailed_trip: DetailedTrip):
    
    pass



# def parse_trip_info(trip_info: List[Vacation]):
#     trip_joined = "\n".join([f"{trip.start_location} to {trip.end_location} from {trip.start_date} to {trip.end_date}" for trip in trip_info])
#     return trip_joined

# @home_router.post("/")
# async def search(user_id: str, vacation_plan: List[Vacation]):
#     response = []
#     try:
#         for vacation in vacation_plan:
#             # NOTE: query the APIs
#             response.append(vacation.model_dump())

#         # Convert vacation_plan to trip_info format
#         trip_info = parse_trip_info(vacation_plan)
        
#         # Call start_convo to initiate a conversation with the parsed trip information
#         await start_convo(user_id=user_id, trip_info=trip_info)

#         return response
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error: {str(e)}")