    import { Suspense } from 'react'
    import { notFound } from 'next/navigation'
    import Link from 'next/link'
    import SearchResults from './search-results'
    import { ChatbotPopup } from '@/components/ChatbotPopup'
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
    import { Button } from "@/components/ui/button"
    import { ArrowLeft } from 'lucide-react'
    import { ErrorBoundary } from 'react-error-boundary'

    function ErrorFallback({ error }: { error: Error }) {
    return (
        <div className="text-center mt-8 text-red-600">
        <p>An error occurred: {error.message}</p>
        <p>Please try your search again or contact support if the problem persists.</p>
        </div>
    )
    }

    export default function SearchPage({
    searchParams
    }: {
    searchParams: { [key: string]: string | string[] | undefined }
    }) {
    const { type, start, end, startDate, endDate } = searchParams

    if (!type || !start || !end) {
        notFound()
    }

    const isFlightSearch = type === 'flight' || type === 'specific'

    return (
        <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
            <Link href="/" passHref>
            <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
            </Button>
            </Link>
            <h1 className="text-3xl font-bold text-center">Search Results</h1>
        </div>
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
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<p className="text-center mt-4">Loading results...</p>}>
            <SearchResults
                type={type as string}
                start={start as string}
                end={end as string}
                startDate={startDate as string}
                endDate={endDate as string}
            />
            </Suspense>
        </ErrorBoundary>
        {isFlightSearch && <ChatbotPopup />}
        </main>
    )
    }

