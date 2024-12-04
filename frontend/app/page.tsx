'use client'

import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from 'react';

export default function Home() {
    const [activeTab, setActiveTab] = useState('inspiration');
    const [inspirationForm, setInspirationForm] = useState({ start: '', end: '' });
    const [specificForm, setSpecificForm] = useState({ start: '', end: '', startDate: '', endDate: '' });
    const [inspirationResults, setInspirationResults] = useState(null);
    const [detailedTripResults, setDetailedTripResults] = useState(null);

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

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Travel Search</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
                    <TabsTrigger value="specific">Specific Search</TabsTrigger>
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
                                type="date"
                                value={specificForm.startDate}
                                onChange={(e) => setSpecificForm({ ...specificForm, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                                id="end-date"
                                type="date"
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
            </Tabs>
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
