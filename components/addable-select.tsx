"use client"

import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddableSelect({
  name,
  options,
  onAdd,
  placeholder,
  addLabel,
  addPlaceholder,
  invalid,
  defaultValue,
}: {
  name: string
  options: string[]
  onAdd: (value: string) => void
  placeholder: string
  addLabel: string
  addPlaceholder: string
  invalid?: boolean
  defaultValue?: string
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  // Newly added options show instantly; `onAdd` persists them to the sheet.
  const [extras, setExtras] = useState<string[]>([])
  const allOptions = [...new Set([...options, ...extras])]

  const confirm = () => {
    const value = draft.trim()
    if (value) {
      setExtras((e) => (e.includes(value) ? e : [...e, value]))
      onAdd(value)
    }
    setDraft("")
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        <Select name={name} defaultValue={defaultValue}>
          <SelectTrigger className="w-full" aria-invalid={invalid}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setAdding((v) => !v)}
          aria-label={addLabel}
          title={addLabel}
        >
          <Plus />
        </Button>
      </div>
      {adding && (
        <div className="flex gap-1.5">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={addPlaceholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                confirm()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={confirm}
            aria-label={addLabel}
          >
            <Check />
          </Button>
        </div>
      )}
    </div>
  )
}
