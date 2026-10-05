"use client"

import Image from "next/image"
import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type LoginDict = Dictionary["login"]

export function LoginForm({ dict }: { dict: LoginDict }) {
  const [state, action, pending] = useActionState(login, undefined)

  const errorText = (key?: string) =>
    key ? (dict.errors[key as keyof LoginDict["errors"]] ?? key) : undefined

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Image
          src="/image.png"
          alt="Minh Global"
          width={56}
          height={56}
          className="mb-1 rounded-lg"
        />
        <CardTitle className="text-lg">{dict.title}</CardTitle>
        <CardDescription>{dict.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          {state?.message && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorText(state.message)}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">{dict.username}</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              aria-invalid={!!state?.errors?.username}
            />
            {state?.errors?.username && (
              <p className="text-xs text-destructive">
                {errorText(state.errors.username[0])}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{dict.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!state?.errors?.password}
            />
            {state?.errors?.password && (
              <p className="text-xs text-destructive">
                {errorText(state.errors.password[0])}
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? dict.submitting : dict.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
