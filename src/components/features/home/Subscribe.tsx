"use client"

/**
 * Thành phần Đăng ký nhận tin (Subscribe Component)
 * 
 * Hiển thị một khối kêu gọi hành động (Call to Action) để người dùng
 * nhập email đăng ký nhận thông báo, khuyến mãi từ cửa hàng.
 */
import { Mail } from "lucide-react"
import { SmallLoading } from "@/components/shared/loading"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribeEmail } from "@/features/marketing/api"
import { useLanguage } from "@/providers/language.provider";
import { cn } from "@/utils/cn"
import { toErrorMessage } from "@/utils/error-message"

interface SubscribeProps {
  /** Biến thể giao diện (default: vuông góc, rounded: bo tròn mạnh) */
  variant?: "default" | "rounded"
  /** Class CSS tùy chỉnh bổ sung */
  className?: string
}

export function Subscribe({ variant = "default", className }: SubscribeProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('invalid_email_format', {}, "Please enter a valid email address"));
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeEmail(email.trim());
      toast.success(t('subscribe_success', {}, "Subscribed successfully!"));
      setEmail("");
    } catch (error) {
      toast.error(toErrorMessage(error, t('subscribe_error', {}, "Failed to subscribe")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={cn("container mx-auto px-4 py-12", className)}>
      <div
        className={cn(
          "flex flex-col lg:flex-row items-center justify-between gap-8 bg-secondary p-8 md:p-12",
          variant === "rounded" ? "rounded-4xl" : "rounded-none"
        )}
      >
        <div className="flex items-start gap-6 max-w-xl">
          <div className="bg-white/20 p-3 rounded-xl shrink-0">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{t('subscribe_newsletter', {}, "Subscribe to Newsletter")}</h3>
            <p className="text-blue-50/90 text-sm leading-relaxed">
              {t('subscribe_description', {}, "Join our tech community to not miss new product launches, get specialized information and weekly promotions.")}
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubscribe();
            }}
            className="relative flex items-center"
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enter_email', {}, "Enter your email here")}
              className="h-14 w-full rounded-xl bg-white pl-6 pr-32 text-base border-none shadow-sm placeholder:text-gray-400 focus-visible:ring-0"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="absolute right-1.5 top-1.5 h-11 rounded-lg bg-[#5B6C8F] px-6 font-semibold text-white hover:bg-[#4A5975]"
            >
              {isSubmitting ? <SmallLoading className="h-4 w-4 text-white" /> : t('subscribe_btn', {}, "SUBSCRIBE")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
