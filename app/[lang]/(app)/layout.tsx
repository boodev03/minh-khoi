import { notFound, redirect } from "next/navigation"
import { lang as rootLang } from "next/root-params"
import { getDictionary } from "../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { verifySession } from "@/lib/session"
import { AppSidebar } from "@/components/app-sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await rootLang()
  if (!hasLocale(lang)) notFound()

  const session = await verifySession()
  if (!session) redirect(`/${lang}/login`)

  const dict = await getDictionary(lang)

  return (
    <div className="flex flex-1">
      <AppSidebar
        lang={lang}
        dict={dict.dashboard.nav}
        username={session.username}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
