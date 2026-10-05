import "server-only"
import { defaultLocale, hasLocale } from "@/lib/i18n"

const dictionaries = {
  vi: () => import("./dictionaries/vi.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
}

export const getDictionary = async (locale: string) =>
  dictionaries[hasLocale(locale) ? locale : defaultLocale]()

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
