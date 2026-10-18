"use client"

import type { ReactElement } from "react"
import { Plus } from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import type { ConcreteElement } from "@/lib/concrete"
import type { ElementScope } from "@/lib/definitions"
import { createElement, updateElementAction } from "@/app/actions/elements"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ElementForm } from "@/components/element-form"

export type ElementOptions = {
  suppliers: string[]
  categories: string[]
}

export function ElementDialog({
  dict,
  element,
  trigger,
  options,
  scope,
}: {
  dict: Dictionary["dashboard"]
  element?: ConcreteElement
  trigger?: ReactElement
  options: ElementOptions
  scope: ElementScope
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <Plus /> {dict.add}
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {element ? dict.form.editTitle : dict.form.title}
          </DialogTitle>
          <DialogDescription>{dict.form.description}</DialogDescription>
        </DialogHeader>
        <ElementForm
          dict={dict.form}
          initial={element}
          action={
            element
              ? updateElementAction.bind(null, element.id, scope)
              : createElement.bind(null, scope)
          }
          suppliers={options.suppliers}
          categories={options.categories}
          lang={scope.lang}
        />
      </DialogContent>
    </Dialog>
  )
}

export function NewElementDialog({
  dict,
  options,
  scope,
}: {
  dict: Dictionary["dashboard"]
  options: ElementOptions
  scope: ElementScope
}) {
  return <ElementDialog dict={dict} options={options} scope={scope} />
}
