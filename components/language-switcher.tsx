"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { locales, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function FlagVN({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <rect width="60" height="30" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="30,6 32.06,12.17 38.56,12.22 33.33,16.08 35.29,22.28 30,18.5 24.71,22.28 26.67,16.08 21.44,12.22 27.94,12.17"
      />
    </svg>
  )
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id="gb-clip">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#gb-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          stroke="#fff"
          strokeWidth="6"
        />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          stroke="#C8102E"
          strokeWidth="2.5"
        />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

const flags: Record<Locale, typeof FlagVN> = {
  vi: FlagVN,
  en: FlagGB,
}

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  const rest = pathname.replace(/^\/(vi|en)/, "")

  return (
    <div className="flex w-full items-center gap-1 rounded-lg border p-1">
      {locales.map((locale) => {
        const Flag = flags[locale]
        return (
          <Link
            key={locale}
            href={`/${locale}${rest}`}
            title={locale === "vi" ? "Tiếng Việt" : "English"}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium uppercase transition-colors",
              locale === current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flag className="h-3.5 w-6 shrink-0 rounded-[2px] ring-1 ring-foreground/10" />
            {locale}
          </Link>
        )
      })}
    </div>
  )
}
