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
    const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start, end, startDate, endDate }),
    })

    if (!response.ok) {
        throw new Error('Failed to fetch search results')
    }

    return response.json()
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
    const results = await getSearchResults({ type, start, end, startDate, endDate })

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
    }

