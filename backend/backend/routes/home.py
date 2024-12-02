from datetime import datetime
import json
from time import sleep
from typing import List
import os
from urllib.parse import quote

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
    
    sorted_output_itineraries = sorted(output_itineraries, key=lambda x: x.price)[:5]
    
    await start_detailed_trip_convo(detailed_trip, sorted_output_itineraries)
    
    return output_itineraries

#for hotels inputs
class HotelIds(BaseModel):
    city: str

class HotelOptions(BaseModel):
    district_id: int
    check_in_date: str
    check_out_date: str

#for hotels outputs
class HotelDistrict(BaseModel):
    district: str
    district_id: int

class HotelSummary(BaseModel):
    hotel_name: str
    hotel_id: str
    distance: str
    hotel_price: str

class HotelDetails(BaseModel):
    hotel_name: str
    hotel_description: str
    check_in_time: str
    check_out_time: str
    location: str
    rating: int

@home_router.post("/get_hotel_district")
async def get_hotel_district(hotel_district: HotelIds) -> List[HotelDistrict]:
    city = hotel_district.city
    city_url = quote(city)
    
    url = f"https://sky-scanner3.p.rapidapi.com/hotels/auto-complete?query={city_url}"
    r = requests.get(url, headers={
        "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
        "x-rapidapi-key": os.getenv("API_KEY1")
    })

    if r.status_code != 200:
        print("something went wrong")

    response_json = r.json()

    data_list = response_json["data"]

    district_options = []
    for data in data_list: 
        district = data["entityName"]
        district_id = data["entityId"]
        
        district_options.append(HotelDistrict(district=district, district_id=district_id))

    return district_options

@home_router.post("/get_hotel_list")
async def get_hotel_list(hotel_options: HotelOptions) -> List[HotelSummary]:
    district_id = hotel_options.district_id
    check_in_date = hotel_options.check_in_date
    check_out_date = hotel_options.check_out_date

    url = f"https://sky-scanner3.p.rapidapi.com/hotels/search?entityId={district_id}&checkin={check_in_date}&checkout={check_out_date}"
    
    r = requests.get(url, headers={
        "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
        "x-rapidapi-key": os.getenv("API_KEY1")
    })

    if r.status_code != 200:
        print("something went wrong")
        print(r.json())

    response_json = r.json()

    completionPercentage = response_json["data"]["status"]["completionPercentage"]

    while completionPercentage != 100:
        r = requests.get(url, headers={
            "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
            "x-rapidapi-key": os.getenv("API_KEY1")
        })
        response_json = r.json()
        completionPercentage = response_json["data"]["status"]["completionPercentage"]
        sleep(0.5)

    hotel_options = response_json["data"]["results"]["hotelCards"]
    
    output_hotels = []

    for hotel_option in hotel_options:
        name = hotel_option["name"]
        id = hotel_option["id"]
        price = hotel_option["cheapestPrice"]
        distance = hotel_option["distance"]

        output_hotels.append(HotelSummary(hotel_name=name, hotel_id=id, distance=distance, hotel_price=price))
   
    return output_hotels

@home_router.post("/get_hotel_details")
async def get_hotel_details(hotel_id: str) -> HotelDetails:
    
    url = f"https://sky-scanner3.p.rapidapi.com/hotels/detail?id={hotel_id}"
    r = requests.get(url, headers={
        "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
        "x-rapidapi-key": os.getenv("API_KEY1")
    })

    if r.status_code != 200:
        print("something went wrong")

    response_json = r.json()

    data = response_json["data"]
    hotel_name = data["general"]["name"]
    hotel_description = data["goodToKnow"]["description"]["content"]
    check_in_time = data["goodToKnow"]["checkinTime"]["title"] + " " + data["goodToKnow"]["checkinTime"]["time"]
    check_out_time = data["goodToKnow"]["checkoutTime"]["title"] + " " + data["goodToKnow"]["checkoutTime"]["time"]
    location = data["location"]["address"]
    rating = data["reviews"]["rating"]

    output_hotel_details = HotelDetails(hotel_name=hotel_name, hotel_description=hotel_description,
                                        check_in_time=check_in_time, check_out_time=check_out_time,
                                        location=location, rating=rating)
    
    return output_hotel_details