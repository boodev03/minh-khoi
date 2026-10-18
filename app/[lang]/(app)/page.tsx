import { notFound } from "next/navigation"
import { getDictionary } from "../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { getElements } from "@/lib/concrete"
import { getBuildings, getProjects } from "@/lib/projects"
import {
  createProjectAction,
  deleteProjectAction,
  renameProjectAction,
} from "@/app/actions/projects"
import { EntityList } from "@/components/entity-list"

export const dynamic = "force-dynamic"

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const t = dict.projects
  const [projects, buildings, elements] = await Promise.all([
    getProjects(),
    getBuildings(),
    getElements(),
  ])

  const items = projects.map((p) => {
    const own = buildings.filter((b) => b.projectId === p.id)
    const ids = new Set(own.map((b) => b.id))
    return {
      id: p.id,
      name: p.name,
      href: `/${lang}/projects/${p.id}`,
      meta: t.projectMeta
        .replace("{buildings}", String(own.length))
        .replace(
          "{elements}",
          String(elements.filter((e) => ids.has(e.buildingId)).length)
        ),
    }
  })

  return (
    <div className="p-6">
      <h2 className="mb-1 text-lg font-semibold">{t.title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t.subtitle}</p>
      <EntityList
        items={items}
        dict={{
          add: t.newProject,
          createTitle: t.newProject,
          editTitle: t.editProject,
          namePlaceholder: t.projectName,
          empty: t.noProjects,
          edit: t.edit,
          delete: t.delete,
          save: t.save,
          cancel: t.cancel,
          errors: {
            required: t.errors.required,
            notEmpty: t.errors.projectNotEmpty,
          },
        }}
        onCreate={async (name) => {
          "use server"
          return createProjectAction(name, lang)
        }}
        onRename={async (id, name) => {
          "use server"
          return renameProjectAction(id, name, lang)
        }}
        onDelete={async (id) => {
          "use server"
          return deleteProjectAction(id, lang)
        }}
      />
    </div>
  )
}
