    'use client'

    import { useState } from 'react'
    import { Button } from "@/components/ui/button"
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
    import { Input } from "@/components/ui/input"
    import { ScrollArea } from "@/components/ui/scroll-area"
    import { MessageCircle, X } from 'lucide-react'

    interface Message {
    text: string
    isUser: boolean
    }

    export function ChatbotPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hello! How can I assist you with your flight search today?", isUser: false }
    ])
    const [input, setInput] = useState('')

    const handleSendMessage = () => {
        if (input.trim()) {
        setMessages([...messages, { text: input, isUser: true }])
        // Here you would typically send the message to your chatbot API
        // and then add the response to the messages
        setMessages(prev => [...prev, { text: "I'm a demo chatbot. In a real application, I would provide helpful responses about flights!", isUser: false }])
        setInput('')
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
            <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-12 h-12 p-0"
            aria-label="Open chat"
            >
            <MessageCircle className="h-6 w-6" />
            </Button>
        )}
        {isOpen && (
            <Card className="w-80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Support</CardTitle>
                <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setIsOpen(false)}
                >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={`mb-4 ${
                        message.isUser ? 'text-right' : 'text-left'
                    }`}
                    >
                    <span
                        className={`inline-block p-2 rounded-lg ${
                        message.isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                    >
                        {message.text}
                    </span>
                    </div>
                ))}
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                }}
                className="flex w-full items-center space-x-2"
                >
                <Input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit">Send</Button>
                </form>
            </CardFooter>
            </Card>
        )}
        </div>
    )
    }

