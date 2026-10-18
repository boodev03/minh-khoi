import {
  Blocks,
  CircleCheck,
  CircleX,
  Clock,
  Droplets,
  TriangleAlert,
} from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import type { DashboardStats } from "@/lib/stats"
import { StatCard, type StatCardTone } from "@/components/stat-card"

export function StatsGrid({
  stats,
  dict,
}: {
  stats: DashboardStats
  dict: Dictionary["dashboard"]["stats"]
}) {
  const items: {
    title: string
    value: number
    icon: typeof Blocks
    tone: StatCardTone
  }[] = [
    { title: dict.totalElements, value: stats.totalElements, icon: Blocks, tone: "default" },
    { title: dict.curing, value: stats.curing, icon: Droplets, tone: "info" },
    { title: dict.dueForTesting, value: stats.dueForTesting, icon: Clock, tone: "warning" },
    { title: dict.overdue, value: stats.overdue, icon: TriangleAlert, tone: "danger" },
    { title: dict.passed, value: stats.passed, icon: CircleCheck, tone: "success" },
    { title: dict.failed, value: stats.failed, icon: CircleX, tone: "danger" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <StatCard key={item.title} {...item} className="xl:col-span-2" />
      ))}
    </div>
  )
}
