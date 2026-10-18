"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  Check,
  ChevronsUpDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

type NavDict = Dictionary["dashboard"]["nav"]

export function AppSidebar({
  lang,
  dict,
  username,
  projects,
}: {
  lang: Locale
  dict: NavDict
  username: string
  projects: Project[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const rest = pathname.replace(/^\/(vi|en)/, "") || "/"
  const currentId = rest.match(/^\/projects\/([^/]+)/)?.[1]
  const current = projects.find((p) => p.id === currentId)

  const items: { href: string; label: string; icon: LucideIcon }[] = [
    { href: `/${lang}`, label: dict.projects, icon: Building2 },
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

      <div className="border-b p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border bg-background px-3 py-2 text-left text-sm font-medium hover:bg-muted"
              />
            }
          >
            <Building2 className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">
              {current?.name ?? dict.selectProject}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => router.push(`/${lang}/projects/${p.id}`)}
              >
                <span className="flex-1 truncate">{p.name}</span>
                {p.id === currentId && <Check />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${lang}`)}>
              {dict.allProjects}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            item.href === `/${lang}`
              ? rest === "/" || rest.startsWith("/projects")
              : rest.startsWith(item.href.slice(lang.length + 1))
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
