import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type StatCardTone =
  | "default"
  | "info"
  | "warning"
  | "success"
  | "danger"

const toneStyles: Record<StatCardTone, string> = {
  default: "bg-muted text-foreground",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "default",
  className,
}: {
  title: string
  value: number | string
  icon: LucideIcon
  tone?: StatCardTone
  className?: string
}) {
  return (
    <Card className={cn("[--card-spacing:--spacing(5)]", className)}>
      <div className="flex items-start justify-between gap-3 px-(--card-spacing)">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-3xl font-semibold tabular-nums">{value}</span>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            toneStyles[tone]
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  )
}
