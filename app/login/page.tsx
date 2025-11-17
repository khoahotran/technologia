"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await login(email, password);
      window.location.href = "/";
    } catch {
      alert("Sai thông tin đăng nhập");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Đăng nhập</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "12px 0" }}
      />

      <input
        type="password"
        placeholder="Mật khẩu"
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "12px 0" }}
      />

      <button onClick={handleLogin}>Đăng nhập</button>
    </div>
  );
}
