export const locales = ["vi", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "vi"

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale)
