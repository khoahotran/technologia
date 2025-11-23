import Link from "next/link";
import { Facebook, Youtube, Instagram, Linkedin, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Social */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm max-w-xs">
                Stay connected with our tech community
              </p>
              <div className="flex space-x-3">
                <Button variant="secondary" size="icon" className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                  <Youtube className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-600 hover:text-primary transition-colors text-sm">About us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary transition-colors text-sm">Contact us</Link></li>
              <li><Link href="/products" className="text-gray-600 hover:text-primary transition-colors text-sm">Products</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-primary transition-colors text-sm">Login</Link></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-primary transition-colors text-sm">Sign up</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Area */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Customer Area</h3>
            <ul className="space-y-4">
              <li><Link href="/account" className="text-gray-600 hover:text-primary transition-colors text-sm">My Account</Link></li>
              <li><Link href="/orders" className="text-gray-600 hover:text-primary transition-colors text-sm">Orders</Link></li>
              <li><Link href="/cart" className="text-gray-600 hover:text-primary transition-colors text-sm">My Cart</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-primary transition-colors text-sm">Terms</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Contact</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">We'd love to hear from you!</p>
              <p className="text-gray-600 text-sm">Drop us a message anytime.</p>
              
              <div className="flex items-center space-x-3 py-2">
                <Headphones className="h-8 w-8 text-gray-800" />
                <div>
                  <p className="text-xs text-gray-500">Have any question?</p>
                  <p className="font-bold text-blue-900">(+84)123456789</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-2">
                {/* Placeholder for App Store Buttons */}
                <div className="border rounded-md px-3 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                   <div className="text-xs">
                     <p className="text-[10px] leading-none text-gray-500">Download on</p>
                     <p className="font-semibold leading-tight text-gray-800">Google Play</p>
                   </div>
                </div>
                <div className="border rounded-md px-3 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                   <div className="text-xs">
                     <p className="text-[10px] leading-none text-gray-500">Download on</p>
                     <p className="font-semibold leading-tight text-gray-800">Amazon.com</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
