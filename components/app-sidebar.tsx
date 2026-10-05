"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  Tags,
  Truck,
  type LucideIcon,
} from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import type { Locale } from "@/lib/i18n"
import { logout } from "@/app/actions/auth"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavDict = Dictionary["dashboard"]["nav"]

export function AppSidebar({
  lang,
  dict,
  username,
}: {
  lang: Locale
  dict: NavDict
  username: string
}) {
  const pathname = usePathname()
  const rest = pathname.replace(/^\/(vi|en)/, "") || "/"

  const items: { href: string; label: string; icon: LucideIcon }[] = [
    { href: `/${lang}`, label: dict.overview, icon: LayoutDashboard },
    { href: `/${lang}/categories`, label: dict.categories, icon: Tags },
    { href: `/${lang}/suppliers`, label: dict.suppliers, icon: Truck },
  ]

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <Image
          src="/image.png"
          alt="Minh Global"
          width={30}
          height={30}
          className="rounded-md"
        />
        <span className="text-sm font-semibold">Minh Global</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            item.href === `/${lang}` ? rest === "/" : rest.startsWith(item.href.slice(lang.length + 1))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t p-3">
        <LanguageSwitcher current={lang} />
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {username}
          </span>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              title={dict.logout}
              aria-label={dict.logout}
            >
              <LogOut />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
