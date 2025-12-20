"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AddressForm() {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Firstname *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Last name *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phone Number *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Province *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ward *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Street *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">No *</label>
          <Input className="bg-[#F9F8FE] border-gray-200" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Note</label>
        <Textarea className="bg-[#F9F8FE] border-gray-200 min-h-[100px]" />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="default-address" />
        <label
          htmlFor="default-address"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Set as default address
        </label>
      </div>

      <div className="flex justify-center pt-4">
        <Button className="w-40 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold">
          Create
        </Button>
      </div>
    </div>
  )
}
