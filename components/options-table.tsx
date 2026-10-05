"use client"

import { useState, useSyncExternalStore } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { useOptionsStore } from "@/lib/options-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DataTable,
  type DataTableColumn,
  type DataTablePaginationLabels,
} from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type OptionsPageDict = Dictionary["dashboard"]["optionsPage"]

const emptySubscribe = () => () => {}

export function OptionsTablePage({
  kind,
  dict,
}: {
  kind: "suppliers" | "categories"
  dict: Dictionary["dashboard"]
}) {
  const items = useOptionsStore((s) => s[kind])
  const add = useOptionsStore((s) =>
    kind === "suppliers" ? s.addSupplier : s.addCategory
  )
  const remove = useOptionsStore((s) =>
    kind === "suppliers" ? s.removeSupplier : s.removeCategory
  )
  const update = useOptionsStore((s) =>
    kind === "suppliers" ? s.updateSupplier : s.updateCategory
  )
  const meta = dict.optionsPage[kind]

  return (
    <OptionsTable
      title={meta.title}
      placeholder={meta.addPlaceholder}
      items={items}
      onAdd={add}
      onUpdate={update}
      onRemove={remove}
      dict={dict.optionsPage}
      labels={dict.pagination}
    />
  )
}

export function OptionsTable({
  title,
  placeholder,
  items,
  onAdd,
  onUpdate,
  onRemove,
  dict,
  labels,
}: {
  title: string
  placeholder: string
  items: string[]
  onAdd: (v: string) => void
  onUpdate: (oldValue: string, newValue: string) => void
  onRemove: (v: string) => void
  dict: OptionsPageDict
  labels: DataTablePaginationLabels
}) {
  const [draft, setDraft] = useState("")
  const [editing, setEditing] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  // Gate persisted (localStorage) options until after hydration to
  // avoid SSR/client mismatches.
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const add = () => {
    const value = draft.trim()
    if (value) onAdd(value)
    setDraft("")
  }

  const saveEdit = () => {
    if (editing !== null) onUpdate(editing, editDraft)
    setEditing(null)
  }

  const columns: DataTableColumn<string>[] = [
    {
      header: "#",
      className: "w-12 text-right",
      cell: (_row, i) => i + 1,
    },
    {
      header: dict.name,
      cell: (row) => row,
    },
    {
      header: dict.actions,
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setEditing(row)
              setEditDraft(row)
            }}
            aria-label={`${dict.edit} ${row}`}
            title={dict.edit}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(row)}
            aria-label={`${dict.remove} ${row}`}
            title={dict.remove}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-1.5">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={add}
            aria-label={dict.add}
          >
            <Plus /> {dict.add}
          </Button>
        </div>
        <DataTable
          columns={columns}
          rows={hydrated ? items : []}
          getRowKey={(row) => row}
          emptyText={dict.empty}
          labels={labels}
        />
      </CardContent>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dict.editTitle} — {title}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            placeholder={dict.name}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                saveEdit()
              }
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="button" onClick={saveEdit}>
              {dict.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
