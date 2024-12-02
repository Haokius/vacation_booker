    'use client'

    import { useState } from 'react'
    import { useRouter } from 'next/navigation'
    import { Button } from "@/components/ui/button"
    import { Input } from "@/components/ui/input"
    import { Label } from "@/components/ui/label"
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

    export default function Home() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('inspiration')
    const [inspirationForm, setInspirationForm] = useState({ start: '', end: '' })
    const [specificForm, setSpecificForm] = useState({ start: '', end: '', startDate: '', endDate: '' })

    const handleInspirationSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const searchParams = new URLSearchParams({
        type: 'inspiration',
        start: inspirationForm.start,
        end: inspirationForm.end
        })
        router.push(`/search?${searchParams.toString()}`)
    }

    const handleSpecificSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const searchParams = new URLSearchParams({
        type: 'specific',
        start: specificForm.start,
        end: specificForm.end,
        startDate: specificForm.startDate,
        endDate: specificForm.endDate
        })
        router.push(`/search?${searchParams.toString()}`)
    }

    return (
        <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Travel Search</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
            <TabsTrigger value="specific">Specific Search</TabsTrigger>
            </TabsList>
            
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
            </TabsContent>
            
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
            </TabsContent>
        </Tabs>
        </main>
    )
    }

