"use client"

/**
 * Thành phần Chatbot Hỗ trợ (Support Chatbot Component)
 * 
 * Cung cấp cửa sổ chat trực tuyến nằm ở góc dưới bên phải màn hình.
 * - Hỗ trợ các câu hỏi thường gặp (Quick Questions).
 * - Có cơ chế phản hồi tự động dựa trên từ khóa (Rule-based bot).
 * - Hỗ trợ thu nhỏ (Minimize) và đóng/mở cửa sổ chat.
 */
import { MessageCircle, X, Send, Minus } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Định nghĩa cấu trúc một tin nhắn */
interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

/** Danh sách các câu hỏi gợi ý nhanh */
const QUICK_QUESTIONS = [
  "Đơn hàng của tôi ở đâu?",
  "Chính sách đổi trả như thế nào?",
  "Có miễn phí vận chuyển không?",
  "Làm sao để liên hệ hỗ trợ?"
]

/** 
 * Bản đồ các phản hồi tự động dựa trên từ khóa xuất hiện trong câu hỏi
 */
const AUTO_RESPONSES: Record<string, string> = {
  "đơn hàng": "Bạn có thể theo dõi trạng thái đơn hàng trong phần 'Đơn hàng' của tài khoản. Nếu bạn có mã đơn hàng, tôi có thể kiểm tra giúp bạn.",
  "order": "Bạn có thể theo dõi trạng thái đơn hàng trong phần 'Đơn hàng' của tài khoản. Nếu bạn có mã đơn hàng, tôi có thể kiểm tra giúp bạn.",
  "đổi trả": "Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ khi mua hàng. Sản phẩm phải còn nguyên vẹn trạng thái ban đầu.",
  "vận chuyển": "Miễn phí vận chuyển cho đơn hàng trên 1.000.000 VNĐ. Phí vận chuyển tiêu chuẩn là 30.000 VNĐ.",
  "liên hệ": "Bạn có thể liên hệ đội ngũ hỗ trợ tại support@techstore.com hoặc gọi (+84) 123 456 789.",
  "xin chào": "Xin chào! 👋 Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn hôm nay?",
  "hello": "Xin chào! 👋 Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn hôm nay?",
  "tạm biệt": "Tạm biệt bạn! Chúc bạn một ngày tốt lành.",
  "default": "Tôi chưa hiểu rõ ý của bạn. Vui lòng liên hệ đội ngũ hỗ trợ trực tiếp để được trợ giúp chi tiết hơn."
}

/**
 * Thành phần Chatbot
 */
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Xin chào! 👋 Tôi là trợ lý ảo của TechStore. Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  /** Tự động cuộn xuống cuối danh sách tin nhắn khi có tin mới */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  /** Xử lý gửi tin nhắn từ người dùng */
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    /** Mô phỏng phản hồi của Bot sau một khoảng thời gian ngắn */
    setTimeout(() => {
      const lowerText = text.toLowerCase()
      let responseText = AUTO_RESPONSES['default']

      // Duyệt qua các từ khóa để tìm câu trả lời phù hợp nhất
      for (const key in AUTO_RESPONSES) {
        if (lowerText.includes(key)) {
          responseText = AUTO_RESPONSES[key]
          break
        }
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      }])
    }, 800)
  }

  /** Đóng/Mở cửa sổ chat */
  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 1. Cửa sổ chat chính */}
      {isOpen && !isMinimized && (
        <Card className="w-[350px] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-base">Hỗ trợ trực tuyến</CardTitle>
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
            {/* Vùng hiển thị tin nhắn */}
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

            {/* Các nút câu hỏi nhanh (Chỉ hiện lúc đầu) */}
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

            {/* Thanh nhập liệu */}
            <div className="p-4 bg-white border-t rounded-b-lg">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập tin nhắn..."
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

      {/* 2. Nút kích hoạt khi đang thu nhỏ */}
      {isMinimized && (
        <Button
          className="rounded-full shadow-lg h-12 w-12 bg-primary animate-bounce p-0"
          onClick={() => setIsMinimized(false)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* 3. Nút kích hoạt ban đầu khi cửa sổ đang đóng */}
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
