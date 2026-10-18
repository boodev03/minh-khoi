import "server-only"

import { appendRow, deleteRow, readRange, updateRow } from "@/lib/sheets"

export type OptionKind = "suppliers" | "categories"

// Option lists live in the "Suppliers" / "Categories" sheet tabs (col A,
// data from row 2 — row 1 is the header).

export async function getOptions(kind: OptionKind): Promise<string[]> {
  const rows = await readRange(kind, "A2:A")
  return rows.map((r) => r[0]).filter(Boolean)
}

export async function addOption(kind: OptionKind, name: string) {
  const value = name.trim()
  if (!value) return
  const existing = await getOptions(kind)
  if (existing.includes(value)) return
  await appendRow(kind, [value])
}

export async function renameOption(
  kind: OptionKind,
  oldName: string,
  newName: string
) {
  const value = newName.trim()
  if (!value || value === oldName) return
  const rows = await readRange(kind, "A2:A")
  const idx = rows.findIndex((r) => r[0] === oldName)
  if (idx === -1) return
  await updateRow(kind, idx + 2, [value])
}

export async function removeOption(kind: OptionKind, name: string) {
  const rows = await readRange(kind, "A2:A")
  const idx = rows.findIndex((r) => r[0] === name)
  if (idx === -1) return
  await deleteRow(kind, idx + 2)
}
