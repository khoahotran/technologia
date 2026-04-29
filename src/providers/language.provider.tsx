"use client";

/**
 * Provider Cung cấp Ngôn ngữ (i18n Context)
 *
 * Quản lý state đa ngôn ngữ ở phía client, cung cấp dictionary (dữ liệu dịch) 
 * cho các component. Hiển thị màn hình loading nếu file ngôn ngữ chưa được tải xong.
 */

import { createContext, useContext, useEffect, useState } from "react";

import { FullLoading } from "@/components/shared/loading";
import type { Language } from "@/locales/languages.interface";
import { initLocale, loadLocale, setLocale as setRuntimeLocale } from "@/locales/locale";

/** Kiểu dữ liệu của Language Context */
type LanguageContextType = {
  /** Mã ngôn ngữ hiện tại (VD: 'en', 'vi') */
  locale: string;
  /** Từ điển chứa các chuỗi dịch thuật dựa theo `locale` hiện tại */
  locales: Language;
  /** Hàm dùng để đổi ngôn ngữ của toàn ứng dụng */
  setLocale: (locale: string) => void;
  /** Hàm dịch thuật hỗ trợ biến động */
  t: (key: string, replacements?: Record<string, string | number>, defaultValue?: string) => string;
};

const defaultContextValue: LanguageContextType = {
  locale: "en",
  locales: { locale: "en" },
  setLocale: () => {},
  t: (key: string, _replacements?: Record<string, string | number>, defaultValue?: string) => defaultValue || key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locale, setLocaleState] = useState(() => initLocale());
  const [locales, setLocales] = useState<Language>(initialLocales);

  // LƯU Ý: KHÔNG XÓA DEPENDENCY DƯỚI ĐÂY MẶC DÙ LINTER (BIOME) CÓ THỂ CẢNH BÁO
  // Việc chỉ phụ thuộc vào `locale` đảm bảo file JSON tương ứng được lazy load đúng lúc.
  useEffect(() => {
    loadLocale(locale).then((data) => setLocales(data));
  }, [locale]);

  const handleSetLocale = (newLocale: string) => {
    setRuntimeLocale(newLocale);
    setLocaleState(newLocale === "vi" ? "vi" : "en");
  };

  /**
   * Hàm hỗ trợ lấy chuỗi dịch (i18n) với biến thay thế động
   */
  const t = (key: string, replacements?: Record<string, string | number>, defaultValue?: string) => {
    let text = (locales as Record<string, string>)?.[key] || defaultValue || key;

    if (replacements && typeof text === 'string') {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, locales, setLocale: handleSetLocale, t }}>
      {/* 
        Để tránh lỗi flash content (hiển thị chuỗi chưa dịch), ta render một
        FullLoading screen cho đến khi file JSON locales được tải xong. 
      */}
      {locales ? children : <FullLoading />}
    </LanguageContext.Provider>
  );
};

/**
 * Hook tiện ích giúp Component lấy các thông tin nội dung đã được Localize (i18n).
 */

export const useLanguage = () => {
  return useContext(LanguageContext);
};

/** Dữ liệu khởi tạo ngôn ngữ lúc mount (trước khi useEffect chạy) */
const initialLocales: Language = {
  locale: "en",
};
