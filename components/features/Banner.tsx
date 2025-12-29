"use client"

import Autoplay from "embla-carousel-autoplay"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export default function Banner() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  const slides = [
    {
      id: 1,
      title: "Desktop heading something here",
      description: "Desktop heading something here",
      color: "bg-gray-100",
    },
    {
      id: 2,
      title: "New Arrival Collection",
      description: "Discover the latest trends in technology",
      color: "bg-blue-50",
    },
    {
      id: 3,
      title: "Special Offer Today",
      description: "Get up to 50% off on selected items",
      color: "bg-pink-50",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
        {/* Main Carousel - Takes up 2/3 width on large screens */}
        <div className="lg:col-span-2 h-full">
          <Carousel
            plugins={[plugin.current]}
            className="w-full h-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
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
                              Button
                            </Button>
                          </div>
                        </div>

                        {/* Carousel Indicators (Mock) */}
                        <div className="absolute bottom-8 left-12 flex gap-2">
                          <div className="w-8 h-2 bg-primary rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" /> */}
          </Carousel>
        </div>

        {/* Side Banners - Takes up 1/3 width on large screens */}
        <div className="flex flex-col gap-6 h-full">
          {/* Top Side Banner */}
          <div className="flex-1 bg-blue-50 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="z-10 space-y-2">
              <h3 className="text-xl font-bold text-gray-900 w-2/3">
                Desktop heading something here
              </h3>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="bg-transparent border-blue-200 text-blue-600 hover:bg-blue-100 rounded-full px-6">
                  Button X
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Side Banner */}
          <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-2">
              <h3 className="text-xl font-bold text-gray-900 w-2/3">
                Desktop heading something here
              </h3>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full px-6">
                  Button X
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
