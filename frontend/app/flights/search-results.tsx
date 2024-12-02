    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

    async function getSearchResults(searchParams: {
    type: string
    start: string
    end: string
    startDate?: string
    endDate?: string
    }) {
    const { type, start, end, startDate, endDate } = searchParams
    const endpoint = type === 'inspiration' ? '/api/get_inspiration' : '/api/get_detailed_trip'
    
    try {
        const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start, end, startDate, endDate }),
        })

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (!data || !data.results) {
        throw new Error('Invalid response format')
        }

        return data.results
    } catch (error) {
        console.error('Error fetching search results:', error)
        throw error
    }
    }

    export default async function SearchResults({
    type,
    start,
    end,
    startDate,
    endDate
    }: {
    type: string
    start: string
    end: string
    startDate?: string
    endDate?: string
    }) {
    try {
        const results = await getSearchResults({ type, start, end, startDate, endDate })

        if (results.length === 0) {
        return <p className="text-center mt-8">No results found. Please try a different search.</p>
        }

        return (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result: any, index: number) => (
            <Card key={index}>
                <CardHeader>
                <CardTitle>{result.title}</CardTitle>
                </CardHeader>
                <CardContent>
                <p>{result.description}</p>
                {result.price && <p className="font-bold mt-2">Price: ${result.price}</p>}
                </CardContent>
            </Card>
            ))}
        </div>
        )
    } catch (error) {
        return (
        <div className="mt-8 text-center text-red-600">
            <p>An error occurred while fetching search results. Please try again later.</p>
        </div>
        )
    }
    }

