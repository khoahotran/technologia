"use client"

import Link from "next/link"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddressCard } from "@/components/features/checkout/AddressCard"

export default function AddressBookPage() {
  // Mock data
  const addresses = [
    {
      id: "1",
      name: "Customer name",
      phone: "Customer phone number",
      address: "Customer address (note, no, street, ward, city, province)",
      isDefault: true,
    },
    {
      id: "2",
      name: "Customer name",
      phone: "Customer phone number",
      address: "Customer address (note, no, street, ward, city, province)",
      isDefault: false,
    },
    {
      id: "3",
      name: "Customer name",
      phone: "Customer phone number",
      address: "Customer address (note, no, street, ward, city, province)",
      isDefault: false,
    },
  ]

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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
            <Info className="h-5 w-5 text-[#3E93B3]" />
          </div>

          {/* Address List */}
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                name={address.name}
                phone={address.phone}
                address={address.address}
                isDefault={address.isDefault}
              />
            ))}
          </div>

          {/* Create New Address Button */}
          <Link href="/address-book/new">
            <Button className="w-full bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white font-medium h-12">
              Create new address
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
