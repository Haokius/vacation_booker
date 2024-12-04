import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface DataPoint {
x: number; // price
y: number; // score
z?: number; // for point size
}

interface ScatterPlotProps {
data: DataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
if (active && payload && payload.length) {
    return (
    <Card className="bg-background border-primary">
        <CardContent className="p-2">
        <p className="font-semibold">Score: {payload[0].value.toFixed(2)}</p>
        <p className="font-semibold">Price: ${payload[1].value.toFixed(2)}</p>
        </CardContent>
    </Card>
    );
}
return null;
};

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

// Enhance data for hover effects
const enhancedData = data.map((point, index) => ({
    ...point,
    z: hoveredIndex === index ? 1000 : 100, // Enlarged size when hovered
}));

return (
    <ResponsiveContainer width="100%" height={400}>
    <ScatterChart
        margin={{
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
        }}
    >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
        type="number"
        dataKey="y" // Switch to "y" for score
        name="Score"
        unit=""
        padding={{ left: 10, right: 10 }}
        tickCount={6}
        label={{ value: 'Score', position: 'bottom', offset: 0 }}
        />
        <YAxis
        type="number"
        dataKey="x" // Switch to "x" for price
        name="Price"
        unit="$"
        padding={{ top: 10, bottom: 10 }}
        tickCount={5}
        label={{ value: 'Price ($)', angle: -90, position: 'left' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
        name="Flights"
        data={enhancedData}
        fill="#8884d8"
        onMouseEnter={(_, index) => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        >
        {enhancedData.map((entry, index) => (
            <circle
            key={`circle-${index}`}
            fill={`hsl(${entry.x * 120}, 70%, 50%)`} // Use `x` (price) for color variation if needed
            r={hoveredIndex === index ? 8 : 4}
            />
        ))}
        </Scatter>
    </ScatterChart>
    </ResponsiveContainer>
);
};
