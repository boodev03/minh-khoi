"use server"

import { revalidatePath } from "next/cache"
import {
  addOption,
  removeOption,
  renameOption,
  type OptionKind,
} from "@/lib/options"

export async function addOptionAction(
  kind: OptionKind,
  name: string,
  lang: string
) {
  await addOption(kind, name)
  revalidatePath(`/${lang}`, "layout")
}

export async function updateOptionAction(
  kind: OptionKind,
  oldName: string,
  newName: string,
  lang: string
) {
  await renameOption(kind, oldName, newName)
  revalidatePath(`/${lang}`, "layout")
}

export async function deleteOptionAction(
  kind: OptionKind,
  name: string,
  lang: string
) {
  await removeOption(kind, name)
  revalidatePath(`/${lang}`, "layout")
}
