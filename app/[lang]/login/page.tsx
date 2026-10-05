import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary } from "../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { LoginForm } from "@/components/login-form"

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return { title: `${dict.login.title} | Minh Global` }
}

export default async function LoginPage({
  params,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-10">
      <LoginForm dict={dict.login} />
    </main>
  )
}
