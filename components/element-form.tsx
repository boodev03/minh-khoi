"use client"

import { useActionState } from "react"
import { createElement } from "@/app/actions/elements"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import type { FormState } from "@/lib/definitions"
import type { ConcreteElement } from "@/lib/concrete"
import { useOptionsStore } from "@/lib/options-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { AddableSelect } from "@/components/addable-select"

type FormDict = Dictionary["dashboard"]["form"]
type FormErrors = FormDict["errors"]

export function ElementForm({
  dict,
  initial,
  action,
}: {
  dict: FormDict
  initial?: ConcreteElement
  action?: (
    state: FormState,
    formData: FormData
  ) => Promise<FormState>
}) {
  const [state, formAction, pending] = useActionState(
    action ?? createElement,
    undefined
  )
  const suppliers = useOptionsStore((s) => s.suppliers)
  const categories = useOptionsStore((s) => s.categories)
  const addSupplier = useOptionsStore((s) => s.addSupplier)
  const addCategory = useOptionsStore((s) => s.addCategory)
  const supplierOptions = initial?.supplier
    ? [...new Set([...suppliers, initial.supplier])]
    : suppliers
  const categoryOptions = initial?.category
    ? [...new Set([...categories, initial.category])]
    : categories

  const errorText = (key?: string) =>
    key ? (dict.errors[key as keyof FormErrors] ?? key) : undefined

  const fieldError = (field: string) =>
    state?.errors?.[field]?.[0] && (
      <p className="text-xs text-destructive">
        {errorText(state.errors[field]![0])}
      </p>
    )

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="name">{dict.element}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initial?.name}
          aria-invalid={!!state?.errors?.name}
        />
        {fieldError("name")}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pourDate">{dict.pourDate}</Label>
        <Input
          id="pourDate"
          name="pourDate"
          type="date"
          defaultValue={initial?.pourDate}
          aria-invalid={!!state?.errors?.pourDate}
        />
        {fieldError("pourDate")}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{dict.supplier}</Label>
        <AddableSelect
          name="supplier"
          options={supplierOptions}
          onAdd={addSupplier}
          placeholder={dict.selectPlaceholder}
          addLabel={dict.addOption}
          addPlaceholder={dict.newOptionPlaceholder}
          invalid={!!state?.errors?.supplier}
          defaultValue={initial?.supplier}
        />
        {fieldError("supplier")}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{dict.category}</Label>
        <AddableSelect
          name="category"
          options={categoryOptions}
          onAdd={addCategory}
          placeholder={dict.selectPlaceholder}
          addLabel={dict.addOption}
          addPlaceholder={dict.newOptionPlaceholder}
          invalid={!!state?.errors?.category}
          defaultValue={initial?.category}
        />
        {fieldError("category")}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="volume">{dict.volume}</Label>
        <Input
          id="volume"
          name="volume"
          type="number"
          min="0"
          step="0.1"
          inputMode="decimal"
          defaultValue={initial?.volume}
          aria-invalid={!!state?.errors?.volume}
        />
        {fieldError("volume")}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="curingDays">{dict.curingDays}</Label>
        <Input
          id="curingDays"
          name="curingDays"
          type="number"
          min="1"
          max="30"
          step="1"
          defaultValue={initial?.curingDays ?? 7}
          inputMode="numeric"
          aria-invalid={!!state?.errors?.curingDays}
        />
        {fieldError("curingDays")}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="curingRemindersPerDay">
          {dict.curingRemindersPerDay}
        </Label>
        <Input
          id="curingRemindersPerDay"
          name="curingRemindersPerDay"
          type="number"
          min="0"
          max="10"
          step="1"
          defaultValue={initial?.curingRemindersPerDay ?? 2}
          inputMode="numeric"
          aria-invalid={!!state?.errors?.curingRemindersPerDay}
        />
        {fieldError("curingRemindersPerDay")}
      </div>

      <DialogFooter className="sm:col-span-2">
        <DialogClose
          render={<Button type="button" variant="outline" />}
        >
          {dict.cancel}
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? dict.submitting : dict.submit}
        </Button>
      </DialogFooter>
    </form>
  )
}
