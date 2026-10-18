import type { ConcreteElement } from "@/lib/concrete"

export type DashboardStats = {
  totalElements: number
  curing: number
  dueForTesting: number
  overdue: number
  passed: number
  failed: number
}

export function computeStats(elements: ConcreteElement[]): DashboardStats {
  const count = (status: string) =>
    elements.filter((e) => e.status === status).length

  return {
    totalElements: elements.length,
    curing: count("curing"),
    dueForTesting: count("due"),
    overdue: count("overdue"),
    passed: count("passed"),
    failed: count("failed"),
  }
}
