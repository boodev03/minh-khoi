import { notFound } from "next/navigation"
import {
  Blocks,
  CircleCheck,
  CircleX,
  Clock,
  Droplets,
  FileSpreadsheet,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDictionary } from "../dictionaries"
import { hasLocale } from "@/lib/i18n"
import { getDashboardStats } from "@/lib/stats"
import { getElements } from "@/lib/concrete"
import { StatCard, type StatCardTone } from "@/components/stat-card"
import { ElementsTable } from "@/components/elements-table"
import { NewElementDialog } from "@/components/new-element-dialog"

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const stats = getDashboardStats()
  const elements = getElements()

  const items: { title: string; value: number; icon: typeof Blocks; tone: StatCardTone }[] = [
    { title: dict.dashboard.stats.totalElements, value: stats.totalElements, icon: Blocks, tone: "default" },
    { title: dict.dashboard.stats.curing, value: stats.curing, icon: Droplets, tone: "info" },
    { title: dict.dashboard.stats.dueForTesting, value: stats.dueForTesting, icon: Clock, tone: "warning" },
    { title: dict.dashboard.stats.overdue, value: stats.overdue, icon: TriangleAlert, tone: "danger" },
    { title: dict.dashboard.stats.passed, value: stats.passed, icon: CircleCheck, tone: "success" },
    { title: dict.dashboard.stats.failed, value: stats.failed, icon: CircleX, tone: "danger" },
  ]

  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">
        {dict.dashboard.subtitle}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <StatCard key={item.title} {...item} className="xl:col-span-2" />
        ))}
      </div>
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {dict.dashboard.table.title}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={`/${lang}/export`} download />}
          >
            <FileSpreadsheet /> {dict.dashboard.export}
          </Button>
          <NewElementDialog dict={dict.dashboard} />
        </div>
      </div>
      <ElementsTable
        rows={elements}
        dict={dict.dashboard.table}
        dashboardDict={dict.dashboard}
        labels={dict.dashboard.pagination}
        locale={lang}
      />
    </div>
  )
}
