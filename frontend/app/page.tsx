'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Star } from 'lucide-react'

// Mock data for hotels
const hotelsData = [
  { id: 1, name: "Sunset Resort", price: 150, rating: 4, image: "/placeholder.svg" },
  { id: 2, name: "Ocean View Hotel", price: 200, rating: 5, image: "/placeholder.svg" },
  { id: 3, name: "Mountain Retreat", price: 120, rating: 3, image: "/placeholder.svg" },
  { id: 4, name: "City Center Inn", price: 180, rating: 4, image: "/placeholder.svg" },
  { id: 5, name: "Lakeside Lodge", price: 160, rating: 4, image: "/placeholder.svg" },
  { id: 6, name: "Luxury Palace", price: 300, rating: 5, image: "/placeholder.svg" },
  { id: 7, name: "Cozy Cabin", price: 100, rating: 3, image: "/placeholder.svg" },
  { id: 8, name: "Beachfront Bungalow", price: 250, rating: 5, image: "/placeholder.svg" },
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const hotel = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-bold">{hotel.name}</p>
        <p>Price: ${hotel.price}</p>
        <p>Rating: {hotel.rating} stars</p>
      </div>
    );
  }
  return null;
};

export default function TripPlanner() {
  const [priceRange, setPriceRange] = useState([0, 300])
  const [qualityFilter, setQualityFilter] = useState("all")

  const filteredHotels = hotelsData.filter(hotel => 
    hotel.price >= priceRange[0] && 
    hotel.price <= priceRange[1] && 
    (qualityFilter === "all" || hotel.rating >= parseInt(qualityFilter))
  )

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
    rating: {
      label: "Rating",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Trip Planner</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Price Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              min={0}
              max={300}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mt-2"
            />
            <div className="flex justify-between mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hotel Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="2">2 stars & up</SelectItem>
                <SelectItem value="3">3 stars & up</SelectItem>
                <SelectItem value="4">4 stars & up</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hotels Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredHotels.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Hotel Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="rating" name="rating" unit=" stars" domain={[1, 5]} />
                  <YAxis type="number" dataKey="price" name="price" unit="$" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Hotels" data={filteredHotels} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredHotels.length > 0 ? (
              <div className="flex items-center space-x-4">
                <img
                  src={filteredHotels[0].image}
                  alt={filteredHotels[0].name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-semibold">{filteredHotels[0].name}</h3>
                  <p className="text-sm text-gray-500">${filteredHotels[0].price} per night</p>
                  <div className="flex items-center mt-1">
                    {[...Array(filteredHotels[0].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p>No hotels match your criteria.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredHotels.map(hotel => (
          <Card key={hotel.id}>
            <CardHeader>
              <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover rounded-t-lg" />
            </CardHeader>
            <CardContent>
              <CardTitle>{hotel.name}</CardTitle>
              <CardDescription>${hotel.price} per night</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center">
                {[...Array(hotel.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">{hotel.rating} stars</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}