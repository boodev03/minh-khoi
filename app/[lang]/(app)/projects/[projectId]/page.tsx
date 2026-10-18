import { notFound } from "next/navigation"
import { getDictionary } from "../../../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { getElements } from "@/lib/concrete"
import { getBuildings, getProject } from "@/lib/projects"
import { computeStats } from "@/lib/stats"
import {
  createBuildingAction,
  deleteBuildingAction,
  renameBuildingAction,
} from "@/app/actions/projects"
import { Breadcrumb } from "@/components/breadcrumb"
import { EntityList } from "@/components/entity-list"
import { StatsGrid } from "@/components/stats-grid"

export const dynamic = "force-dynamic"

export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projects/[projectId]">) {
  const { lang, projectId } = await params
  if (!hasLocale(lang)) notFound()

  const [dict, project, buildings] = await Promise.all([
    getDictionary(lang),
    getProject(projectId),
    getBuildings(projectId),
  ])
  if (!project) notFound()

  const t = dict.projects
  const elements = await getElements(buildings.map((b) => b.id))

  const items = buildings.map((b) => ({
    id: b.id,
    name: b.name,
    href: `/${lang}/projects/${projectId}/buildings/${b.id}`,
    meta: t.buildingMeta.replace(
      "{elements}",
      String(elements.filter((e) => e.buildingId === b.id).length)
    ),
  }))

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: t.title, href: `/${lang}` },
          { label: project.name },
        ]}
      />
      <StatsGrid
        stats={computeStats(elements)}
        dict={dict.dashboard.stats}
      />
      <h2 className="mt-8 mb-4 text-sm font-medium text-muted-foreground">
        {t.buildingsTitle}
      </h2>
      <EntityList
        items={items}
        dict={{
          add: t.newBuilding,
          createTitle: t.newBuilding,
          editTitle: t.editBuilding,
          namePlaceholder: t.buildingName,
          empty: t.noBuildings,
          edit: t.edit,
          delete: t.delete,
          save: t.save,
          cancel: t.cancel,
          errors: {
            required: t.errors.required,
            notEmpty: t.errors.buildingNotEmpty,
          },
        }}
        onCreate={async (name) => {
          "use server"
          return createBuildingAction(projectId, name, lang)
        }}
        onRename={async (id, name) => {
          "use server"
          return renameBuildingAction(id, name, lang)
        }}
        onDelete={async (id) => {
          "use server"
          return deleteBuildingAction(id, lang)
        }}
      />
    </div>
  )
}
