"use client"

import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/shared/providers/language.provider"

/**
 * Thành phần Gửi Đánh giá (Give Feedback Client)
 * 
 * Cung cấp giao diện cho người dùng đánh giá chất lượng sản phẩm và dịch vụ sau khi nhận hàng.
 * Bao gồm:
 * - Chọn số sao đánh giá (1-5 sao).
 * - Nhập nội dung bình luận chi tiết.
 * - Hiển thị tóm tắt thông tin đơn hàng đang được đánh giá.
 * 
 * @param id - Mã định danh đơn hàng cần đánh giá
 */
export default function GiveFeedbackClient({ id }: { id: string }) {
  const { t } = useLanguage()
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState("")

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
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between text-sm font-medium text-gray-600">
            <li>{t('all_categories', {}, "All categories")}</li>
            <li>{t('cat_smartphone', {}, "Smartphone")}</li>
            <li>{t('cat_laptop', {}, "Laptop")}</li>
            <li>{t('cat_gaming', {}, "Gaming Equipment")}</li>
            <li>{t('cat_headphone', {}, "Headphone")}</li>
            <li>{t('cat_speaker', {}, "Speaker")}</li>
            <li>{t('cat_others', {}, "Others")}</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">{t('back_to_tracking', {}, "Back to tracking order")}</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 text-center">{t('give_feedback_title', {}, "Give Feedback")}</h1>

          <div className="bg-white p-8 rounded-xl border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{t('order_id_label', {}, "Order ID")}</h3>
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
                  {t('add_feedback_btn', {}, "Add feedback")}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">{t('rating_label', {}, "Rating")}</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-colors"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= rating
                            ? "fill-[#3E93B3] text-[#3E93B3]"
                            : "fill-none text-gray-300"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">{t('comment_label', {}, "Comment")}</h3>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[200px] bg-[#F9F8FE] border-gray-200"
                    placeholder={t('share_experience_placeholder', {}, "Share your experience with this order...")}
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
