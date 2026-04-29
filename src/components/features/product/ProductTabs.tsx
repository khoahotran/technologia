"use client"

/**
 * Thành phần Tab Thông tin Sản phẩm (Product Tabs Component)
 * 
 * Hiển thị các khối thông tin bổ sung cho sản phẩm dưới dạng Tab như: 
 * Mô tả chi tiết (Description), Thông số kỹ thuật (Specs), Đánh giá (Reviews).
 */
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProductTabs() {
  return (
    <Tabs defaultValue="description" className="w-full">
      {/* 1. Danh sách các Tab (Tiêu đề) */}
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

      {/* 2. Nội dung Tab Mô tả (Description) */}
      <TabsContent value="description" className="pt-8">
        <div className="space-y-6 text-gray-600">
          <p>
            Đây là phần hiển thị nội dung mô tả chi tiết của sản phẩm.
            Văn bản giả mặc định: Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry`&apos;`s standard dummy text ever since the 1500s...
          </p>
          <div className="flex justify-center pt-4">
            <Button variant="link" className="text-blue-500 hover:text-blue-600">
              Xem thêm
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* 3. Nội dung Tab Thông số kỹ thuật (Specs) */}
      <TabsContent value="specs" className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border rounded-lg p-8">
          <ul className="space-y-4">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Pin 1000mAh</span></li>
          </ul>
          <ul className="space-y-4 border-l pl-8">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Sử dụng cả ngày</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Sử dụng cả ngày</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Sử dụng cả ngày</span></li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black"></span> <span className="font-medium">Sử dụng cả ngày</span></li>
          </ul>
        </div>
      </TabsContent>

      {/* 4. Nội dung Tab Đánh giá (Reviews) */}
      <TabsContent value="reviews" className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock dữ liệu 3 đánh giá */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-blue-50/50 border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                {/* 5 Ngôi sao */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={`text-sm ${j < 4 ? 'text-primary' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
                {/* Nội dung bình luận */}
                <p className="text-sm font-medium text-gray-900">
                  Phản hồi từ khách hàng: Sản phẩm này dùng tạm được, không quá đặc sắc nhưng được cái tiện dùng cũng như giá ổn áp phết.
                </p>
                {/* Tên người dùng và điểm */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <span>{i}/10</span>
                  <div className="flex items-center gap-2">
                    <span>bởi UyenNhi</span>
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
