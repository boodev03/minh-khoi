"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import {
  deleteElement,
  updateElementStatus,
  uploadElementPhoto,
} from "@/app/actions/elements"
import type { ConcreteElement, ElementStatus } from "@/lib/concrete"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import type { Locale } from "@/lib/i18n"
import {
  DataTable,
  type DataTableColumn,
  type DataTablePaginationLabels,
} from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ElementDialog } from "@/components/new-element-dialog"
import { cn } from "@/lib/utils"

type TableDict = Dictionary["dashboard"]["table"]

const statusStyles: Record<ElementStatus, string> = {
  curing: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  due: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-400",
  passed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
}

function PhotoUploadTile({
  elementId,
  kind,
  lang,
  label,
}: {
  elementId: string
  kind: "pour" | "test"
  lang: string
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (!file) return
          const fd = new FormData()
          fd.set("elementId", elementId)
          fd.set("kind", kind)
          fd.set("lang", lang)
          fd.set("photo", file)
          startTransition(async () => {
            await uploadElementPhoto(fd)
          })
        }}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        title={label}
        aria-label={label}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-dashed border-input text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        <ImagePlus className="h-4 w-4" />
      </button>
    </>
  )
}

export function ElementsTable({
  rows,
  dict,
  dashboardDict,
  labels,
  locale,
}: {
  rows: ConcreteElement[]
  dict: TableDict
  dashboardDict: Dictionary["dashboard"]
  labels: DataTablePaginationLabels
  locale: Locale
}) {
  const [, startStatusTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [lightbox, setLightbox] = useState<{
    photos: string[]
    index: number
  } | null>(null)

  const stepLightbox = (dir: 1 | -1) =>
    setLightbox((lb) =>
      lb
        ? {
            ...lb,
            index:
              (lb.index + dir + lb.photos.length) % lb.photos.length,
          }
        : lb
    )

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") stepLightbox(-1)
      if (e.key === "ArrowRight") stepLightbox(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox !== null])

  const dateFmt = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  )
  const fmtDate = (iso: string) => dateFmt.format(new Date(iso))

  const columns: DataTableColumn<ConcreteElement>[] = [
    {
      header: dict.element,
      cell: (el) => <span className="font-medium">{el.name}</span>,
    },
    {
      header: dict.pourDate,
      cell: (el) => fmtDate(el.pourDate),
    },
    {
      header: dict.supplier,
      cell: (el) => (
        <div className="flex flex-col">
          <span>{el.supplier}</span>
          <span className="text-xs text-muted-foreground">{el.category}</span>
        </div>
      ),
    },
    {
      header: dict.volume,
      className: "text-right",
      cell: (el) => (
        <span className="tabular-nums">
          {el.volume} {dict.m3}
        </span>
      ),
    },
    {
      header: dict.sampleSets,
      className: "text-right",
      cell: (el) => <span className="tabular-nums">{el.sampleSets}</span>,
    },
    {
      header: dict.curing,
      cell: (el) => (
        <div className="flex items-center gap-2">
          <span>
            {dict.curingDays.replace("{days}", String(el.curingDays))}
          </span>
          {el.photoUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() =>
                setLightbox({ photos: el.photoUrls, index: i })
              }
              title={dict.viewPhoto}
              aria-label={dict.viewPhoto}
              className="cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-10 w-10 rounded-md border object-cover"
              />
            </button>
          ))}
          <PhotoUploadTile
            elementId={el.id}
            kind="pour"
            lang={locale}
            label={dict.uploadPhoto}
          />
        </div>
      ),
    },
    {
      header: dict.test,
      cell: (el) => (
        <div className="flex items-center gap-2">
          {el.testDate ? (
            <div className="flex flex-col">
              <span>{fmtDate(el.testDate)}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {el.testResult} {dict.mpa}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{dict.notTested}</span>
          )}
          {el.testPhotoUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() =>
                setLightbox({ photos: el.testPhotoUrls, index: i })
              }
              title={dict.viewPhoto}
              aria-label={dict.viewPhoto}
              className="cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-10 w-10 rounded-md border object-cover"
              />
            </button>
          ))}
          <PhotoUploadTile
            elementId={el.id}
            kind="test"
            lang={locale}
            label={dict.uploadPhoto}
          />
        </div>
      ),
    },
    {
      header: dict.status,
      cell: (el) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="cursor-pointer">
                <Badge
                  variant="secondary"
                  className={cn("border-0", statusStyles[el.status])}
                >
                  {dict.statuses[el.status]}
                </Badge>
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-auto">
            <DropdownMenuItem
              onClick={() =>
                startStatusTransition(async () => {
                  await updateElementStatus(el.id, "passed", locale)
                })
              }
            >
              <Check /> {dict.statuses.passed}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startStatusTransition(async () => {
                  await updateElementStatus(el.id, "failed", locale)
                })
              }
            >
              <X /> {dict.statuses.failed}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      header: dict.actions,
      className: "w-24 text-right",
      cell: (el) => (
        <div className="flex justify-end gap-1">
          <ElementDialog
            dict={dashboardDict}
            element={el}
            trigger={
              <Button
                variant="ghost"
                size="icon-xs"
                title={dict.edit}
                aria-label={dict.edit}
              >
                <Pencil />
              </Button>
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={deletePending}
            onClick={() =>
              startDeleteTransition(async () => {
                await deleteElement(el.id, locale)
              })
            }
            title={dict.delete}
            aria-label={dict.delete}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(el) => el.id}
        emptyText={dict.empty}
        labels={labels}
      />
      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          {lightbox && (
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.photos[lightbox.index]}
                alt=""
                className="max-h-[75vh] w-auto rounded-md object-contain"
              />
              {lightbox.photos.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-1/2 left-2 -translate-y-1/2"
                    onClick={() => stepLightbox(-1)}
                    aria-label={labels.previous}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    onClick={() => stepLightbox(1)}
                    aria-label={labels.next}
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>
          )}
          {lightbox && lightbox.photos.length > 1 && (
            <p className="text-center text-xs text-muted-foreground tabular-nums">
              {lightbox.index + 1} / {lightbox.photos.length}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
