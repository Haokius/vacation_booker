    import { Suspense } from 'react'
    import { notFound } from 'next/navigation'
    import SearchResults from './search-results'
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

    export default function SearchPage({
    searchParams
    }: {
    searchParams: { [key: string]: string | string[] | undefined }
    }) {
    const { type, start, end, startDate, endDate } = searchParams

    if (!type || !start || !end) {
        notFound()
    }

    return (
        <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Search Results</h1>
        <Card>
            <CardHeader>
            <CardTitle>
                {type === 'inspiration' ? 'Inspiration' : 'Specific'} Search
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p>From: {start}</p>
            <p>To: {end}</p>
            {type === 'specific' && (
                <>
                <p>Start Date: {startDate}</p>
                <p>End Date: {endDate}</p>
                </>
            )}
            </CardContent>
        </Card>
        <Suspense fallback={<p className="text-center mt-4">Loading results...</p>}>
            <SearchResults
            type={type as string}
            start={start as string}
            end={end as string}
            startDate={startDate as string}
            endDate={endDate as string}
            />
        </Suspense>
        </main>
    )
    }

