"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { Ghost } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const { locales } = useLanguage();

  return (
    <div
      className="h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center"
      // style={{
      // 	height:
      // 		"calc(100vh - var(--header-height) - var(--header-border-b) - var(--footer-height) - var(--footer-border-t))",
      // }}
    >
      <Ghost className="h-16 w-16 text-zinc-400" />
      <h1 className="mt-6 font-bold text-4xl text-zinc-800">
        {locales.notFoundPage.title}
      </h1>
      <p className="mt-2 text-zinc-600">{locales.notFoundPage.message}</p>
      <div className="mt-6 flex gap-4">
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => router.back()}
        >
          {locales.notFoundPage.action.back}
        </Button>
        <Button className="cursor-pointer" onClick={() => router.push("/")}>
          {locales.notFoundPage.action.home}
        </Button>
      </div>
    </div>
  );
}
