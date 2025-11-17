let currentLocale = "en";

function getStoredLocale(): string {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("locale") || "en";
}

export function initLocale(): string {
    currentLocale = getStoredLocale();
    return currentLocale;
}

export function setLocale(locale: string) {
    currentLocale = locale;
    if (typeof window !== "undefined") {
        localStorage.setItem("locale", locale);
    }
}

export function getLocale() {
    return currentLocale;
}

export async function loadLocale(locale?: string) {
    const target = locale || currentLocale;
    try {
        const messages = await import(`@/locales/${target}.json`);
        return messages.default || messages;
    } catch {
        console.warn(`Locale "${target}" not found, fallback to "en".`);
        const fallback = await import(`@/locales/en.json`);
        return fallback.default || fallback;
    }
}
