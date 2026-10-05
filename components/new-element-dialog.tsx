"use client"

import type { ReactElement } from "react"
import { Plus } from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import type { ConcreteElement } from "@/lib/concrete"
import { updateElementAction } from "@/app/actions/elements"
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

export function ElementDialog({
  dict,
  element,
  trigger,
}: {
  dict: Dictionary["dashboard"]
  element?: ConcreteElement
  trigger?: ReactElement
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
              ? updateElementAction.bind(null, element.id)
              : undefined
          }
        />
      </DialogContent>
    </Dialog>
  )
}

export function NewElementDialog({
  dict,
}: {
  dict: Dictionary["dashboard"]
}) {
  return <ElementDialog dict={dict} />
}
