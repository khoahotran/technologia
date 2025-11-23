"use client"

import { useState } from "react"
import { MessageCircle, Maximize2, Minimize2, Send, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot" as const,
      text: "Hello bạn, cần giúp gì không?",
    },
    {
      id: 2,
      type: "user" as const,
      text: "Tôi muốn xem đơn hàng",
    },
    {
      id: 3,
      type: "bot" as const,
      text: "Về đơn hàng, mình sẽ tổng hợp lại và gửi bạn như sau:",
    },
  ])

  const shortcuts = [
    { label: "FAQs" },
    { label: "Gợi ý sản phẩm" },
    { label: "Xem sản phẩm mới" },
  ]

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { id: Date.now(), type: "user", text: message }])
      setMessage("")
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 max-h-[600px]">
      {/* Header */}
      <div className="bg-[#D3E4F4] p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#8AB0C3] p-2 rounded-full">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Technologia</h3>
            <p className="text-xs text-gray-600">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="hover:bg-white/50 p-1 rounded transition-colors">
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/50 p-1 rounded transition-colors"
          >
            <Minimize2 className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="p-6 bg-gray-50 border-b border-gray-100 text-center">
        <div className="bg-[#8AB0C3] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">Technologia - Hỗ trợ khách hàng</h4>
        <p className="text-sm text-gray-600 mb-2">
          Hãy đặt câu hỏi và nhận được câu trả lời ngay lập tức
        </p>
        <a href="#" className="text-sm text-[#3E93B3] hover:underline">
          Liên hệ trực tiếp
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[250px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.type === "user" ? "justify-start" : "justify-end"}`}
          >
            {msg.type === "user" && (
              <div className="bg-[#8AB0C3] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                msg.type === "user"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.type === "bot" && (
              <div className="bg-[#8AB0C3] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shortcuts */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 overflow-x-auto">
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 whitespace-nowrap transition-colors"
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2 items-center bg-gray-50 rounded-full px-4 py-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Gõ câu hỏi của bạn"
            className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-sm"
          />
          <button
            onClick={handleSend}
            className="text-[#3E93B3] hover:text-[#2E7393] transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
