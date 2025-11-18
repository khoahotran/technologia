"use client";
import { useAuth } from "@/presentation";
import Link from "next/link";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
      {user && <Link href="/cart">Cart</Link>}
      {user?.role === "admin" && <Link href="/admin">Admin Dashboard</Link>}
      {!user && <Link href="/login">Login</Link>}
    </nav>
  );
}
