'use client'

import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from 'react';
import { ChatbotPopup } from '@/components/ChatbotPopup';

export default function Home() {
    const [activeTab, setActiveTab] = useState('inspiration');
    const [inspirationForm, setInspirationForm] = useState({ start: '', end: '' });
    const [specificForm, setSpecificForm] = useState({ start: '', end: '', startDate: '', endDate: '' });
    const [hotelForm, setHotelForm] = useState({ city: '', checkInDate: '', checkOutDate: ''});

    const [inspirationResults, setInspirationResults] = useState(null);
    const [detailedTripResults, setDetailedTripResults] = useState(null);
    const [hotelDistrictResults, setHotelDistrictResults] = useState(null);
    const [hotelSummaryResults, setHotelSummaryResults] = useState(null);
    const [hotelDetailsResults, setHotelDetailsResults] = useState(null);

    // Handle Inspiration Trip Submit
    const handleInspirationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/home/get_inspiration', {
                origin: inspirationForm.start,
                destination: inspirationForm.end
            });
            setInspirationResults(response.data);
        } catch (error) {
            console.error("Error fetching inspiration trip data:", error);
        }
    };

    // Handle Detailed Trip Submit
    const handleSpecificSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/home/get_detailed_trip', {
                origin: specificForm.start,
                destination: specificForm.end,
                start_date: specificForm.startDate,
                end_date: specificForm.endDate
            });
            setDetailedTripResults(response.data);
        } catch (error) {
            console.error("Error fetching detailed trip data:", error);
        }
    };

    const handleHotelDistricSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/home/get_hotel_district', {
                city: hotelForm.city,
            });
            setHotelDistrictResults(response.data);
            setHotelDetailsResults(null);
            setHotelSummaryResults(null);
        } catch (error) {
            console.error("Error fetching Hotel district data:", error);
        }
    };

    const getHotelListFromDistrict = async (districtId: number, checkInDate: string, checkOutDate: string) => {
        console.log(`getting hotel list from district ${districtId} with check-in ${checkInDate} and check-out ${checkOutDate}`);
        try {
            const response = await axios.post('http://localhost:8000/home/get_hotel_list', {
                district_id: districtId,
                check_in_date: checkInDate,
                check_out_date: checkOutDate
            });
            setHotelSummaryResults(response.data);
        } catch (error) {
            console.error("Error fetching Hotel list data:", error);
        }
    };

    const getHotelDetails = async (hotelSummary: HotelSummary) => {
        console.log(`getting hotel details for hotel ${hotelSummary.hotel_id}`);
        try {
            const response = await axios.post(
                `http://localhost:8000/home/get_hotel_details?hotel_id=${hotelSummary.hotel_id}`,
                {}
            );
            setHotelDetailsResults({details: response.data, summary: hotelSummary});
        } catch (error) {
            console.error("Error fetching hotel details data:", error);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Travel Search</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
                    <TabsTrigger value="specific">Specific Search</TabsTrigger>
                    <TabsTrigger value="hotels">Hotel Search</TabsTrigger>
                </TabsList>

                {/* Inspiration Trip Form */}
                <TabsContent value="inspiration">
                    <form onSubmit={handleInspirationSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="inspiration-start">Start Location</Label>
                            <Input
                                id="inspiration-start"
                                value={inspirationForm.start}
                                onChange={(e) => setInspirationForm({ ...inspirationForm, start: e.target.value })}
                                placeholder="Enter start location"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="inspiration-end">End Location</Label>
                            <Input
                                id="inspiration-end"
                                value={inspirationForm.end}
                                onChange={(e) => setInspirationForm({ ...inspirationForm, end: e.target.value })}
                                placeholder="Enter end location"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Search for Inspiration</Button>
                    </form>
                    {inspirationResults && (
                        <InspirationTripDisplay inspirationResults={inspirationResults} />
                    )}
                </TabsContent>

                {/* Detailed Trip Form */}
                <TabsContent value="specific">
                    <form onSubmit={handleSpecificSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="specific-start">Start Location</Label>
                            <Input
                                id="specific-start"
                                value={specificForm.start}
                                onChange={(e) => setSpecificForm({ ...specificForm, start: e.target.value })}
                                placeholder="Enter start location"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="specific-end">End Location</Label>
                            <Input
                                id="specific-end"
                                value={specificForm.end}
                                onChange={(e) => setSpecificForm({ ...specificForm, end: e.target.value })}
                                placeholder="Enter end location"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                                id="start-date"
                                type="text"
                                value={specificForm.startDate}
                                onChange={(e) => setSpecificForm({ ...specificForm, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                                id="end-date"
                                type="text"
                                value={specificForm.endDate}
                                onChange={(e) => setSpecificForm({ ...specificForm, endDate: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Search</Button>
                    </form>
                    {detailedTripResults && (
                        <DetailedTripDisplay detailedTripResults={detailedTripResults} />
                    )}
                </TabsContent>

                {/* Hotel Search Form */}
                <TabsContent value="hotels">
                    <form onSubmit={handleHotelDistricSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="hotel-city">City</Label>
                            <Input
                                id="hotel-city"
                                value={hotelForm.city}
                                onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                                placeholder="Enter city"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="check-in-date">Check-in Date</Label>
                            <Input
                                id="check-in-date"
                                value={hotelForm.checkInDate}
                                onChange={(e) => setHotelForm({ ...hotelForm, checkInDate: e.target.value })}
                                placeholder="Enter check in date"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="check-out-date">Check-out Date</Label>
                            <Input
                                id="check-out-date"
                                value={hotelForm.checkOutDate}
                                onChange={(e) => setHotelForm({ ...hotelForm, checkOutDate: e.target.value })}
                                placeholder="Enter check out date"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Search Districts</Button>
                    </form>
                    {hotelDistrictResults && (
                        <HotelDistrictDisplay
                            hotelDistrictResults={hotelDistrictResults}
                            onSelectDistrict={(districtId: number) => {
                                console.log(`District ${districtId} selected!`)
                                getHotelListFromDistrict(districtId, hotelForm.checkInDate, hotelForm.checkOutDate);
                                setHotelDistrictResults(null);
                            }}
                        />
                    )}
                    {hotelSummaryResults && (
                        <HotelSummaryDisplay
                            hotelSummaryResults={hotelSummaryResults}
                            onSelectHotelSummary={(hotelSummary: HotelSummary) => {
                                console.log(`Hotel ${hotelSummary.hotel_id} selected!`)
                                getHotelDetails(hotelSummary);
                                setHotelSummaryResults(null);
                            }}
                        />
                    )}
                    {hotelDetailsResults && (
                        <HotelDetailsDisplay
                            hotel_name={hotelDetailsResults.summary.hotel_name}
                            distance={hotelDetailsResults.summary.distance}
                            hotel_price={hotelDetailsResults.summary.hotel_price}
                            hotel_description={hotelDetailsResults.details.hotel_description}
                            check_in_time={hotelDetailsResults.details.check_in_time}
                            check_out_time={hotelDetailsResults.details.check_out_time}
                            location={hotelDetailsResults.details.location}
                            rating={hotelDetailsResults.details.rating}
                        />
                    )}
                </TabsContent>
            </Tabs>

            <div className="fixed bottom-4 right-4 z-50">
                <ChatbotPopup />
            </div>
        </main>
    );
}

type InspirationProposal = {
    price: number;
    departure_date: string;
    arrival_date: string;
};

type InspirationBucket = {
    label: string;
    proposals: InspirationProposal[];
};

type InspirationTripResults = InspirationBucket[];


interface InspirationTripDisplayProps {
    inspirationResults: InspirationTripResults | null
}
// Inspiration Trip Display Component
function InspirationTripDisplay({ inspirationResults }: InspirationTripDisplayProps) {
    return (
        <div className="container mx-auto py-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">Inspiration Trip Results</h2>
            {inspirationResults && inspirationResults.map((bucket, index) => (
                <div key={index} className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4 text-blue-600">{bucket.label}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bucket.proposals.map((proposal, idx) => (
                            <div key={idx} className="p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                                <p className="text-lg font-semibold mb-2">Price: ${proposal.price}</p>
                                <p className="mb-1"><strong>Departure Date:</strong> {new Date(proposal.departure_date).toLocaleDateString()}</p>
                                <p><strong>Arrival Date:</strong> {new Date(proposal.arrival_date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

type FlightSegment = {
    airline: string;
    departure_airport: string;
    arrival_airport: string;
    flight_time: number;
    departure_time: string;
    arrival_time: string;
    flight_number: string;
    stop_count: number;
};

type Itinerary = {
    price: number;
    legs: FlightSegment[];
    score: number;
};

type DetailedTripResults = Itinerary[];

interface DetailedTripDisplayProps {
    detailedTripResults: DetailedTripResults | null;
}

// Detailed Trip Display Component
function DetailedTripDisplay({ detailedTripResults }: DetailedTripDisplayProps) {
    return (
        <div className="container mx-auto py-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">Detailed Trip Results</h2>
            {detailedTripResults && detailedTripResults.map((itinerary, index) => (
                <div key={index} className="mb-8 p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold mb-4 text-green-600">Price: ${itinerary.price.toFixed(2)}</h3>
                    {itinerary.legs.map((leg, idx) => (
                        <div key={idx} className="mb-6 p-4 border rounded-md shadow-sm bg-gray-50">
                            <h4 className="text-lg font-semibold mb-2">{leg.airline} - Flight {leg.flight_number}</h4>
                            <div className="mb-2">
                                <p className="font-medium">Departure Airport: <span className="font-normal">{leg.departure_airport}</span></p>
                                <p className="font-medium">Arrival Airport: <span className="font-normal">{leg.arrival_airport}</span></p>
                            </div>
                            <div className="flex justify-between mb-2">
                                <p className="font-medium">Departure Time: <span className="font-normal">{new Date(leg.departure_time).toLocaleString()}</span></p>
                                <p className="font-medium">Arrival Time: <span className="font-normal">{new Date(leg.arrival_time).toLocaleString()}</span></p>
                            </div>
                            <p className="font-medium">Flight Duration: <span className="font-normal">{Math.floor(leg.flight_time / 60)}h {leg.flight_time % 60}m</span></p>
                            <p className="font-medium">Number of Stops: <span className="font-normal">{leg.stop_count}</span></p>
                        </div>
                    ))}
                    <p className="text-right text-sm text-gray-500">Score: {itinerary.score.toFixed(3)}</p>
                </div>
            ))}
        </div>
    );
}

type HotelDistrict = {
    district: string;
    district_id: number;
};

interface HotelDistrictDisplayProps {
    hotelDistrictResults: HotelDistrict[];
    onSelectDistrict: (districtId: number) => void;
}

// Hotel Districts Display Component
function HotelDistrictDisplay({ hotelDistrictResults, onSelectDistrict }: HotelDistrictDisplayProps) {
    return (
        <div className="container mx-auto py-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">Available Districts</h2>
            {hotelDistrictResults && hotelDistrictResults.map((district, index) => (
                <div
                    key={index}
                    className="mb-8 p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onSelectDistrict(district.district_id)}
                >
                    <h3 className="text-xl font-semibold">{district.district}</h3>
                </div>
            ))}
        </div>
    );
}

type HotelSummary = {
    hotel_name: string;
    hotel_id: string;
    distance: string;
    hotel_price: string;
}

interface HotelSummaryDisplayProps {
    hotelSummaryResults: HotelSummary[];
    onSelectHotelSummary: (hotelSummary: HotelSummary) => void;
}

// Hotel Summaries Display Component
function HotelSummaryDisplay({ hotelSummaryResults, onSelectHotelSummary }: HotelSummaryDisplayProps) {
    return (
        <div className="container mx-auto py-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">Available Hotels</h2>
            {hotelSummaryResults && hotelSummaryResults.map((hotelSummary, index) => (
                <div
                    key={index}
                    className="mb-8 p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onSelectHotelSummary(hotelSummary)}
                >
                    <h3 className="text-xl font-semibold">{hotelSummary.hotel_name}</h3>
                    <div className="mb-2">
                        <p className="font-medium">Price: <span className="font-normal">{hotelSummary.hotel_price}</span></p>
                        <p className="font-medium">Distance: <span className="font-normal">{hotelSummary.distance}</span></p>
                    </div>
                </div>
            ))}
        </div>
    );
}

type HotelDetails = {
    hotel_name: string;
    distance: string;
    hotel_price: string;
    hotel_description: string;
    check_in_time: string;
    check_out_time: string;
    location: string;
    rating: number;
}

// Hotel Details Display Component
function HotelDetailsDisplay(hotelDetails: HotelDetails) {
    return (
        <div className="container mx-auto py-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{hotelDetails.hotel_name}</h2>
            <div className="mb-2">
                <p className="font-medium">Description: <span className="font-normal">{hotelDetails.hotel_description}</span></p>
                <p className="font-medium">Price: <span className="font-normal">{hotelDetails.hotel_price}</span></p>
                <p className="font-medium">Check-In Time: <span className="font-normal">{hotelDetails.check_in_time}</span></p>
                <p className="font-medium">Check-Out Time: <span className="font-normal">{hotelDetails.check_out_time}</span></p>
                <p className="font-medium">Location: <span className="font-normal">{hotelDetails.location}</span></p>
                <p className="font-medium">Distance: <span className="font-normal">{hotelDetails.distance}</span></p>
                <p className="font-medium">Rating: <span className="font-normal">{hotelDetails.rating}</span></p>
            </div>
        </div>
    );
}