import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { LanguageContext } from "./context"
import { translate, type Language, type TranslationKey } from "./translations"

const STORAGE_KEY = "tvna-language"

function readInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "km" || stored === "en") return stored
  } catch {
    // localStorage blocked — fall back to default.
  }
  return "km"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // localStorage unavailable (private mode) — in-memory state still works.
    }
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "km" ? "en" : "km"))
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translate(language, key),
    [language]
  )

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
