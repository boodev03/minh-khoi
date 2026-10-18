"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Pencil, Plus, Trash2 } from "lucide-react"
import type { EntityResult } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export type EntityItem = {
  id: string
  name: string
  href: string
  meta: string
}

export type EntityListDict = {
  add: string
  createTitle: string
  editTitle: string
  namePlaceholder: string
  empty: string
  edit: string
  delete: string
  save: string
  cancel: string
  errors: { required: string; notEmpty: string }
}

type Props = {
  items: EntityItem[]
  dict: EntityListDict
  onCreate: (name: string) => Promise<EntityResult>
  onRename: (id: string, name: string) => Promise<EntityResult>
  onDelete: (id: string) => Promise<EntityResult>
}

// Name-only list of cards with create / rename / delete; shared by the
// project and building pages.
export function EntityList({ items, dict, onCreate, onRename, onDelete }: Props) {
  const [pending, startTransition] = useTransition()
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; id: string } | null
  >(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  const open = (next: NonNullable<typeof dialog>, name = "") => {
    setDialog(next)
    setDraft(name)
    setError(null)
  }

  const run = (action: () => Promise<EntityResult>, onOk?: () => void) =>
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(dict.errors[result.error])
      else {
        setError(null)
        onOk?.()
      }
    })

  const submit = () => {
    if (!dialog) return
    run(
      () =>
        dialog.mode === "create"
          ? onCreate(draft)
          : onRename(dialog.id, draft),
      () => setDialog(null)
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => open({ mode: "create" })}>
          <Plus /> {dict.add}
        </Button>
      </div>

      {error && !dialog && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {dict.empty}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="transition-colors hover:bg-muted/40">
              <CardContent className="flex items-center justify-between gap-2">
                <Link href={item.href} className="min-w-0 flex-1">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.meta}
                  </div>
                </Link>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    title={dict.edit}
                    aria-label={`${dict.edit} ${item.name}`}
                    onClick={() => open({ mode: "edit", id: item.id }, item.name)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending}
                    title={dict.delete}
                    aria-label={`${dict.delete} ${item.name}`}
                    onClick={() => run(() => onDelete(item.id))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialog !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? dict.editTitle : dict.createTitle}
            </DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={dict.namePlaceholder}
            aria-invalid={!!error}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                submit()
              }
            }}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="button" disabled={pending} onClick={submit}>
              {dict.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
