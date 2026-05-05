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
import Image from "next/image"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useLanguage } from "@/providers/language.provider"
import Link from "next/link"

export default function Banner() {
  const { t } = useLanguage();
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
      title: t('banner_slide1_title', {}, "Top Tech Deals"),
      description: t('banner_slide1_desc', {}, "Get new devices at extremely attractive prices."),
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000&auto=format&fit=crop",
      color: "bg-gray-100",
      link: "/products",
    },
    {
      id: 2,
      title: t('banner_slide2_title', {}, "New Arrivals Collection"),
      description: t('banner_slide2_desc', {}, "Explore the latest tech trends today."),
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
      color: "bg-blue-50",
      link: "/products?sort=newest",
    },
    {
      id: 3,
      title: t('banner_slide3_title', {}, "Special Offer Today"),
      description: t('banner_slide3_desc', {}, "Up to 50% off select products."),
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
      color: "bg-pink-50",
      link: "/products?sort=price_asc",
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
                    <Card className={`h-full border-none shadow-none ${slide.color} rounded-3xl overflow-hidden relative group`}>
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority={slide.id === 1}
                      />
                      {/* Overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent"></div>

                      <CardContent className="flex flex-col justify-center h-[400px] p-12 relative z-10">
                        <div className="max-w-md space-y-4">
                          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            {slide.title}
                          </h2>
                          <p className="text-lg text-gray-800 font-medium">
                            {slide.description}
                          </p>
                          <div className="pt-4">
                            <Link href={slide.link}>
                              <Button size="lg" className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 shadow-lg border-none">
                                {t('banner_explore_now', {}, "Explore Now")}
                              </Button>
                            </Link>
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
                                : "w-2 bg-gray-400 hover:bg-gray-600"
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
          <div className="flex-1 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group shadow-md border border-white/20">
            <Image
              src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000&auto=format&fit=crop"
              alt="Desktop Solutions"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-white/60 group-hover:bg-white/40 transition-colors"></div>
            <div className="z-10 space-y-2 relative">
              <h3 className="text-xl font-bold text-gray-900 w-2/3">
                {t('banner_side1_title', {}, "Ultimate Desktop Solutions")}
              </h3>
              <div className="pt-4">
                <Link href="/products?name=Desktop">
                  <Button variant="outline" size="sm" className="bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full px-6 transition-all">
                    {t('view_more', {}, "View more")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Biểu ngữ phụ phía dưới */}
          <div className="flex-1 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-md group border border-white/20">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
              alt="Audio Accessories"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-white/60 group-hover:bg-white/40 transition-colors"></div>
            <div className="z-10 space-y-2 relative">
              <h3 className="text-xl font-bold text-gray-900 w-2/3">
                {t('banner_side2_title', {}, "Premium Audio Accessories")}
              </h3>
              <div className="pt-4">
                <Link href="/products?name=Audio">
                  <Button variant="outline" size="sm" className="bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-800 hover:text-white rounded-full px-6 transition-all">
                    {t('buy_now', {}, "Buy now")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
