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
import { getLocale, loadLocale } from "@/locales/locale";

/** Kiểu dữ liệu của Language Context */
type LanguageContextType = {
  /** Mã ngôn ngữ hiện tại (VD: 'en', 'vi') */
  locale: string;
  /** Từ điển chứa các chuỗi dịch thuật dựa theo `locale` hiện tại */
  locales: Language;
  /** Hàm dùng để đổi ngôn ngữ của toàn ứng dụng */
  setLocale: (locale: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locale, setLocaleState] = useState(getLocale());
  const [locales, setLocales] = useState<Language>(initialLocales);

  // LƯU Ý: KHÔNG XÓA DEPENDENCY DƯỚI ĐÂY MẶC DÙ LINTER (BIOME) CÓ THỂ CẢNH BÁO
  // Việc chỉ phụ thuộc vào `locale` đảm bảo file JSON tương ứng được lazy load đúng lúc.
  useEffect(() => {
    loadLocale().then((data) => setLocales(data));
  }, [locale]);

  const handleSetLocale = (newLocale: string) => {
    setLocaleState(newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, locales, setLocale: handleSetLocale }}>
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
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage phải được sử dụng bên trong một LanguageProvider");
  return context;
};

/** Dữ liệu khởi tạo ngôn ngữ lúc mount (trước khi useEffect chạy) */
const initialLocales: Language = {
  locale: "en",
};
