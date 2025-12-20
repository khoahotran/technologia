"use client"

import { MessageCircle, X, Send, Minus } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const QUICK_QUESTIONS = [
  "Where is my order?",
  "What is your return policy?",
  "Do you offer free shipping?",
  "How can I contact support?"
]

const AUTO_RESPONSES: Record<string, string> = {
  "order": "You can track your order status in the 'Orders' section of your account. If you have an order ID, I can look it up.",
  "return": "We accept returns within 30 days of purchase. Items must be in original condition.",
  "shipping": "Free shipping is available for orders over 1,000,000 VND. Standard shipping is 30,000 VND.",
  "contact": "You can reach our support team at support@techstore.com or call (+84)123456789.",
  "hello": "Hi there! How can I help you today?",
  "default": "I'm not sure about that. Please contact our support team for detailed assistance."
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! 👋 I'm your virtual assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const newMessage: Message = {
      id: Math.random().toString(36),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase()
      let responseText = AUTO_RESPONSES['default'] || "I'm not sure about that. Please contact our support team for detailed assistance."

      for (const key in AUTO_RESPONSES) {
        if (lowerText.includes(key)) {
          responseText = AUTO_RESPONSES[key] || responseText
          break
        }
      }

      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      }])
    }, 800)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && !isMinimized && (
        <Card className="w-[350px] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-base">Support Chat</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsMinimized(true)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={scrollRef} className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground ml-auto rounded-br-none"
                      : "bg-white border shadow-sm mr-auto rounded-bl-none text-gray-800"
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Questions Chips */}
            {messages.length < 3 && (
              <div className="px-4 py-2 flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="text-xs bg-white border border-primary/30 text-primary px-3 py-1 rounded-full hover:bg-primary/5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 bg-white border-t rounded-b-lg">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {isMinimized && (
        <Button
          className="rounded-full shadow-lg h-12 w-12 bg-primary animate-bounce p-0"
          onClick={() => setIsMinimized(false)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {!isOpen && !isMinimized && (
        <Button
          className="rounded-full shadow-lg h-14 w-14 bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
          onClick={toggleChat}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}
    </div>
  )
}
