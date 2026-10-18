import "server-only"

import { getElements } from "@/lib/concrete"
import { appendRow, deleteRow, readRange, updateRow } from "@/lib/sheets"

export type Project = { id: string; name: string }
export type Building = { id: string; projectId: string; name: string }

// "Projects" (id, name) and "Buildings" (id, projectId, name) sheet tabs;
// data from row 2, row 1 is the header. Elements point at a building via
// their buildingId column.

export async function getProjects(): Promise<Project[]> {
  const rows = await readRange("projects", "A2:B")
  return rows.filter((r) => r[0]).map(([id, name]) => ({ id, name: name ?? "" }))
}

export async function getProject(id: string) {
  return (await getProjects()).find((p) => p.id === id) ?? null
}

export async function getBuildings(projectId?: string): Promise<Building[]> {
  const rows = await readRange("buildings", "A2:C")
  const all = rows
    .filter((r) => r[0])
    .map(([id, projectId, name]) => ({ id, projectId, name: name ?? "" }))
  return projectId ? all.filter((b) => b.projectId === projectId) : all
}

export async function getBuilding(id: string) {
  return (await getBuildings()).find((b) => b.id === id) ?? null
}

async function findRowNumber(
  tab: "projects" | "buildings",
  range: string,
  id: string
) {
  const rows = await readRange(tab, range)
  const idx = rows.findIndex((r) => r[0] === id)
  return idx === -1 ? null : { rowNumber: idx + 2, row: rows[idx] }
}

export async function addProject(name: string) {
  const value = name.trim()
  if (!value) return null
  const id = crypto.randomUUID()
  await appendRow("projects", [id, value])
  return id
}

export async function renameProject(id: string, name: string) {
  const value = name.trim()
  const found = await findRowNumber("projects", "A2:B", id)
  if (!value || !found) return
  await updateRow("projects", found.rowNumber, [id, value])
}

/** Returns "notEmpty" when the project still has buildings. */
export async function removeProject(id: string) {
  if ((await getBuildings(id)).length) return "notEmpty" as const
  const found = await findRowNumber("projects", "A2:B", id)
  if (found) await deleteRow("projects", found.rowNumber)
  return null
}

export async function addBuilding(projectId: string, name: string) {
  const value = name.trim()
  if (!value || !(await getProject(projectId))) return
  await appendRow("buildings", [crypto.randomUUID(), projectId, value])
}

export async function renameBuilding(id: string, name: string) {
  const value = name.trim()
  const found = await findRowNumber("buildings", "A2:C", id)
  if (!value || !found) return
  await updateRow("buildings", found.rowNumber, [id, found.row[1], value])
}

/** Returns "notEmpty" when the building still has elements. */
export async function removeBuilding(id: string) {
  if ((await getElements([id])).length) return "notEmpty" as const
  const found = await findRowNumber("buildings", "A2:C", id)
  if (found) await deleteRow("buildings", found.rowNumber)
  return null
}
