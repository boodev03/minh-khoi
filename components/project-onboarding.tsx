"use client"

import { useActionState } from "react"
import Image from "next/image"
import { LogOut } from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { createFirstProjectAction } from "@/app/actions/projects"
import { logout } from "@/app/actions/auth"
import type { Locale } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProjectOnboarding({
  lang,
  dict,
  logoutLabel,
}: {
  lang: Locale
  dict: Dictionary["projects"]
  logoutLabel: string
}) {
  const [state, formAction, pending] = useActionState(
    createFirstProjectAction.bind(null, lang),
    undefined
  )
  const t = dict.onboarding

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <LanguageSwitcher current={lang} />
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            title={logoutLabel}
            aria-label={logoutLabel}
          >
            <LogOut />
          </Button>
        </form>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Image
            src="/image.png"
            alt="Minh Global"
            width={48}
            height={48}
            className="mb-2 rounded-md"
          />
          <CardTitle className="text-lg">{t.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t.nameLabel}</Label>
              <Input
                id="name"
                name="name"
                autoFocus
                aria-invalid={!!state?.errors?.name}
              />
              {state?.errors?.name && (
                <p className="text-xs text-destructive">
                  {dict.errors.required}
                </p>
              )}
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? t.submitting : t.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
