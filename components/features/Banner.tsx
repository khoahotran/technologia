"use client"

/**
 * Thành phần Biểu ngữ Trang chủ (Banner Feature Component)
 * 
 * Hiển thị khu vực nổi bật nhất trên trang chủ, bao gồm:
 * - Một Carousel lớn bên trái với các Slide khuyến mãi tự động trượt.
 * - Hai biểu ngữ phụ nhỏ hơn bên phải.
 * - Tích hợp Embla Carousel và Autoplay.
 */
import Autoplay from "embla-carousel-autoplay"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "@/components/ui/carousel"

export default function Banner() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  // Kết nối API của Carousel để theo dõi Slide hiện tại 
  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  /** Dữ liệu các Slide trong Carousel chính */
  const slides = [
    {
      id: 1,
      title: "Ưu đãi công nghệ đỉnh cao",
      description: "Sắm sửa thiết bị mới với mức giá cực kỳ hấp dẫn.",
      color: "bg-gray-100",
    },
    {
      id: 2,
      title: "Bộ sưu tập Hàng mới về",
      description: "Khám phá những xu hướng công nghệ mới nhất hiện nay.",
      color: "bg-blue-50",
    },
    {
      id: 3,
      title: "Khuyến mãi đặc biệt hôm nay",
      description: "Giảm giá lên đến 50% cho các sản phẩm chọn lọc.",
      color: "bg-pink-50",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
        {/* 1. Carousel Chính - Chiếm 2/3 bề rộng trên màn hình lớn */}
        <div className="lg:col-span-2 h-full">
          <Carousel
            setApi={setApi}
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 4000 })]}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {slides.map((slide) => (
                <CarouselItem key={slide.id} className="h-full">
                  <div className="p-1 h-full">
                    <Card className={`h-full border-none shadow-none ${slide.color} rounded-3xl`}>
                      <CardContent className="flex flex-col justify-center h-[400px] p-12 relative">
                        <div className="max-w-md space-y-4">
                          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            {slide.title}
                          </h2>
                          <p className="text-lg text-gray-600">
                            {slide.description}
                          </p>
                          <div className="pt-4">
                            <Button size="lg" className="rounded-full px-8 bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm">
                              Khám phá ngay
                            </Button>
                          </div>
                        </div>

                        {/* Chỉ báo phân trang (Indicators) của Carousel */}
                        <div className="absolute bottom-8 left-12 flex gap-2 z-10">
                          {slides.map((_, index) => (
                            <div
                              key={index}
                              onClick={() => api?.scrollTo(index)}
                              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${current === index
                                ? "w-8 bg-primary"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* 2. Các biểu ngữ phụ bên cạnh - Chiếm 1/3 bề rộng */}
        <div className="flex flex-col gap-6 h-full">
          {/* Biểu ngữ phụ phía trên */}
          <div className="flex-1 bg-blue-50 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="z-10 space-y-2">
              <h3 className="text-xl font-bold text-gray-900 w-2/3">
                Giải pháp máy tính để bàn tối ưu
              </h3>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="bg-transparent border-blue-200 text-blue-600 hover:bg-blue-100 rounded-full px-6">
                  Xem thêm
                </Button>
              </div>
            </div>
          </div>

          {/* Biểu ngữ phụ phía dưới */}
          <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-2">
              <h3 className="text-xl font-bold text-gray-900 w-2/3">
                Phụ kiện âm thanh cao cấp
              </h3>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full px-6">
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
