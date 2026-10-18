import { notFound, redirect } from "next/navigation"
import { lang as rootLang } from "next/root-params"
import { getDictionary } from "../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { verifySession } from "@/lib/session"
import { getProjects } from "@/lib/projects"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectOnboarding } from "@/components/project-onboarding"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await rootLang()
  if (!hasLocale(lang)) notFound()

  const session = await verifySession()
  if (!session) redirect(`/${lang}/login`)

  const [dict, projects] = await Promise.all([
    getDictionary(lang),
    getProjects(),
  ])

  // No projects yet: every page in the app is replaced by onboarding.
  if (projects.length === 0) {
    return (
      <ProjectOnboarding
        lang={lang}
        dict={dict.projects}
        logoutLabel={dict.dashboard.nav.logout}
      />
    )
  }

  return (
    <div className="flex flex-1">
      <AppSidebar
        lang={lang}
        dict={dict.dashboard.nav}
        username={session.username}
        projects={projects}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
