from datetime import datetime
import json
from typing import List
import os

from dotenv import load_dotenv
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
import requests

from .chat import start_inspiration_trip_convo, start_detailed_trip_convo

home_router = APIRouter(
    prefix="/home",
    tags=["home"],
)

load_dotenv()

#for inputs
class InspirationTrip(BaseModel):
    origin: str
    destination: str

class DetailedTrip(BaseModel):
    origin: str
    destination: str
    start_date: str
    end_date: str

#for outputs
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

class InspirationProposal(BaseModel):
    price: float
    departure_date: str
    arrival_date: str

class InspirationBucket(BaseModel):
    label: str
    proposals: List[InspirationProposal]


@home_router.post("/get_inspiration")
async def get_inspiration(inspiration_trip: InspirationTrip) -> List[InspirationBucket]:
    origin = inspiration_trip.origin
    destination = inspiration_trip.destination

    url = f"https://sky-scanner3.p.rapidapi.com/flights/search-roundtrip?fromEntityId={origin}&toEntityId={destination}"
    r = requests.get(url, headers={
        "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
        "x-rapidapi-key": os.getenv("API_KEY1")
    })

    if r.status_code != 200:
        print("something went wrong")

    response_json = r.json()

    #response_json = None
    #with open("sample_inspiration.json", "r") as f:
    #    response_json = json.loads(f.read())

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
                    outbound_date = str(datetime.strptime(outbound_date_str, "%Y-%m-%d"))

                    inbound_date_str = result_content["inboundLeg"]["localDepartureDate"]
                    inbound_date = str(datetime.strptime(inbound_date_str, "%Y-%m-%d"))

                    proposals.append(InspirationProposal(price=price, departure_date=outbound_date, arrival_date=inbound_date))
        
        output_buckets.append(InspirationBucket(label=label, proposals=proposals))

    await start_inspiration_trip_convo(inspiration_trip, output_buckets)

    return output_buckets

@home_router.post("/get_detailed_trip")
async def get_detailed_trip(detailed_trip: DetailedTrip) -> List[Itinerary]:
    origin = detailed_trip.origin
    destination = detailed_trip.destination
    start_date = detailed_trip.start_date
    end_date = detailed_trip.end_date

    url = f"https://sky-scanner3.p.rapidapi.com/flights/search-roundtrip?fromEntityId={origin}&toEntityId={destination}&departDate={start_date}&returnDate={end_date}"
    r = requests.get(url, headers={
         "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
         "x-rapidapi-key": os.getenv("API_KEY1")
     })
    
    if r.status_code != 200:
        print("something went wrong")

    response_json = r.json()

    print(response_json)

    itineraries = response_json["data"]["itineraries"]
    output_itineraries = []

    for itinerary in itineraries:
        price = itinerary["price"]["raw"]
        score = itinerary["score"]
        legs = itinerary["legs"]

        flight_segments = []

        for leg in legs:
            departure_airport = leg["origin"]["name"]
            departure_airport_code = leg["origin"]["displayCode"]
            arrival_airport = leg["destination"]["name"]
            arrival_airport_code = leg["destination"]["displayCode"]

            departure_time = str(leg["departure"])
            arrival_time = str(leg["arrival"])

            segments = leg["segments"]
            for segment in segments:
                flight_time = segment["durationInMinutes"]

                airline_name = segment["operatingCarrier"]["name"]
                airline_id = segment["operatingCarrier"]["alternateId"]
                flight_number = segment["flightNumber"]
                flight_number_full = airline_id + flight_number

            stop_count = leg["stopCount"]

            flight_segments.append(FlightSegment(airline=airline_name, departure_airport=departure_airport,
                                                    arrival_airport=arrival_airport, flight_time=flight_time,
                                                    departure_time=departure_time, arrival_time=arrival_time,
                                                    flight_number=flight_number_full, stop_count=stop_count))
                
        output_itineraries.append(Itinerary(price=price, legs=flight_segments, score=score))
    
    await start_detailed_trip_convo(detailed_trip, output_itineraries)
    
    return output_itineraries