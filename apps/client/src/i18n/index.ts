import { en, type TranslationSchema } from './locales/en';
import { km } from './locales/km';
import type { SidebarLanguage } from '@/types/sidebar';

export type SupportedLanguage = SidebarLanguage;

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en,
  km,
};

/**
 * Returns the dictionary for the specified language (admin / existing components).
 */
export function getTranslation(
  lang: SupportedLanguage = 'en',
): TranslationSchema {
  return translations[lang] ?? translations.en;
}

/**
 * Returns a translated string via a type-safe selector function.
 * Example: t('en', (d) => d.common.save) -> "Save"
 */
export function t(
  lang: SupportedLanguage,
  selector: (dict: TranslationSchema) => string,
): string {
  return selector(getTranslation(lang));
}

export { en, km, type TranslationSchema };

// App discovery & public experience i18n
export { useLanguage, type LanguageContextValue } from "./context";
export { appEn, type TranslationDictionary } from "./app-en";
export { appKm } from "./app-km";
export { LanguageProvider } from "./language-provider";
export {
  languages,
  translate,
  appTranslations,
  type Language,
  type TranslationKey,
} from "./translations";
