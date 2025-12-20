"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProductTabs() {
  return (
    <Tabs defaultValue="description" className="w-full">
      <div className="border-b border-gray-200">
        <TabsList className="h-auto w-full justify-start gap-8 bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-gray-500 shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Chi tiết
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-gray-500 shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Thông số
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-gray-500 shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Đánh giá
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="description" className="pt-8">
        <div className="space-y-6 text-gray-600">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
          <div className="flex justify-center pt-4">
            <Button variant="link" className="text-blue-500 hover:text-blue-600">
              View more
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="specs" className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border rounded-lg p-8">
          <ul className="space-y-4">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
          </ul>
          <ul className="space-y-4 border-l pl-8">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Use all days</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Use all days</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Use all days</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Use all days</span></li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-blue-50/50 border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={`text-sm ${j < 4 ? 'text-primary' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Sản phẩm này dùng tạm được, không quá đặc sắc nhưng được cái tiện dùng cũng như giá ổn áp phết.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <span>{i}/10</span>
                  <div className="flex items-center gap-2">
                    <span>by UyenNhi</span>
                    <div className="h-4 w-4 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
