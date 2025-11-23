"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function GiveFeedbackPage({ params }: { params: { id: string } }) {
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState("")

  // Mock data
  const order = {
    id: "#123456789ABCXYZ",
    items: [
      { quantity: 1, name: "Product name" },
      { quantity: 1, name: "Product name" },
    ],
    status: "[Order status]",
  }

  return (
    <div className="min-h-screen bg-[#F9F8FE]">
      {/* Header with categories */}
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between text-sm font-medium text-gray-600">
            <li>All categories</li>
            <li>Smartphone</li>
            <li>Laptop</li>
            <li>Gaming Equipment</li>
            <li>Headphone</li>
            <li>Speaker</li>
            <li>Others</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back to tracking order */}
          <Link 
            href={`/orders/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to tracking order</span>
          </Link>

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center">Give Feedback</h1>

          {/* Feedback Form */}
          <div className="bg-white p-8 rounded-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Order Summary */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Order ID</h3>
                  <p className="text-lg font-medium text-gray-700">{order.id}</p>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-2 text-sm text-gray-600">
                      <span>{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  <p className="text-sm text-[#3E93B3] cursor-pointer hover:underline">
                    {order.status}
                  </p>
                </div>

                <Button className="w-full bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white h-12">
                  Add feedback
                </Button>
              </div>

              {/* Right: Rating & Comment */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Rating</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-colors"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "fill-[#3E93B3] text-[#3E93B3]"
                              : "fill-none text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Comment</h3>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[200px] bg-[#F9F8FE] border-gray-200"
                    placeholder="Share your experience with this order..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
