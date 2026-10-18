import { notFound } from "next/navigation"
import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDictionary } from "../../../../../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { computeStats } from "@/lib/stats"
import { getElements } from "@/lib/concrete"
import { getOptions } from "@/lib/options"
import { getBuilding, getProject } from "@/lib/projects"
import { Breadcrumb } from "@/components/breadcrumb"
import { StatsGrid } from "@/components/stats-grid"
import { ElementsTable } from "@/components/elements-table"
import { NewElementDialog } from "@/components/new-element-dialog"

export const dynamic = "force-dynamic"

export default async function BuildingPage({
  params,
}: PageProps<"/[lang]/projects/[projectId]/buildings/[buildingId]">) {
  const { lang, projectId, buildingId } = await params
  if (!hasLocale(lang)) notFound()

  const [dict, project, building] = await Promise.all([
    getDictionary(lang),
    getProject(projectId),
    getBuilding(buildingId),
  ])
  if (!project || !building || building.projectId !== projectId) notFound()

  const [elements, suppliers, categories] = await Promise.all([
    getElements([buildingId]),
    getOptions("suppliers"),
    getOptions("categories"),
  ])
  const scope = { lang, projectId, buildingId }

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: dict.projects.title, href: `/${lang}` },
          { label: project.name, href: `/${lang}/projects/${projectId}` },
          { label: building.name },
        ]}
      />
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">
        {dict.dashboard.subtitle}
      </h2>
      <StatsGrid
        stats={computeStats(elements)}
        dict={dict.dashboard.stats}
      />
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {dict.dashboard.table.title}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a href={`/${lang}/export?buildingId=${buildingId}`} download />
            }
          >
            <FileSpreadsheet /> {dict.dashboard.export}
          </Button>
          <NewElementDialog
            dict={dict.dashboard}
            options={{ suppliers, categories }}
            scope={scope}
          />
        </div>
      </div>
      <ElementsTable
        rows={elements}
        dict={dict.dashboard.table}
        dashboardDict={dict.dashboard}
        options={{ suppliers, categories }}
        labels={dict.dashboard.pagination}
        locale={lang}
        scope={scope}
      />
    </div>
  )
}
