"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { FullLoading } from "@/components/shared/loading";
import type { Language } from "@/locales/languages.interface";
import { getLocale, loadLocale } from "@/locales/locale";

type LanguageContextType = {
  locale: string;
  locales: Language;
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

  // NOT REMOVE DEPENDENCY THIS THOUGH BIOME CHECKED
  useEffect(() => {
    loadLocale().then((data) => setLocales(data));
  }, [locale]);
  // NOT REMOVE DEPENDENCY THIS THOUGH BIOME CHECKED

  const setLocale = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, locales, setLocale }}>
      {locales ? children : <FullLoading />}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

const initialLocales: Language = {
  locale: "en",
};
