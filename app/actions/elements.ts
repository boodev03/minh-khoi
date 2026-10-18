"use server"

import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  ElementFormSchema,
  type ElementScope,
  type FormState,
} from "@/lib/definitions"
import {
  addElement,
  addElementPhoto,
  removeElement,
  setElementStatus,
  updateElement,
  type ElementStatus,
} from "@/lib/concrete"

function parseElementForm(formData: FormData) {
  return ElementFormSchema.safeParse({
    name: formData.get("name"),
    pourDate: formData.get("pourDate"),
    supplier: formData.get("supplier"),
    category: formData.get("category"),
    volume: formData.get("volume"),
    curingDays: formData.get("curingDays"),
    curingRemindersPerDay: formData.get("curingRemindersPerDay"),
  })
}

function buildingPath({ lang, projectId, buildingId }: ElementScope) {
  return `/${lang}/projects/${projectId}/buildings/${buildingId}`
}

export async function createElement(
  scope: ElementScope,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = parseElementForm(formData)

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await addElement({ ...validated.data, buildingId: scope.buildingId })
  redirect(buildingPath(scope))
}

export async function updateElementAction(
  elementId: string,
  scope: ElementScope,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = parseElementForm(formData)

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await updateElement(elementId, validated.data)
  redirect(buildingPath(scope))
}

export async function deleteElement(elementId: string, lang: string) {
  await removeElement(elementId)
  revalidatePath(`/${lang}`)
}

export async function updateElementStatus(
  elementId: string,
  status: ElementStatus,
  lang: string
) {
  if (status !== "passed" && status !== "failed") return
  await setElementStatus(elementId, status)
  revalidatePath(`/${lang}`)
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

export async function uploadElementPhoto(formData: FormData) {
  const elementId = formData.get("elementId")
  const lang = formData.get("lang")
  const kind = formData.get("kind")
  const file = formData.get("photo")

  if (
    typeof elementId !== "string" ||
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > MAX_PHOTO_SIZE
  ) {
    return
  }

  const ext = PHOTO_TYPES[file.type]
  if (!ext) return

  const dir = path.join(process.cwd(), "public", "uploads")
  await mkdir(dir, { recursive: true })
  const filename = `${crypto.randomUUID()}${ext}`
  await writeFile(
    path.join(dir, filename),
    Buffer.from(await file.arrayBuffer())
  )

  await addElementPhoto(
    elementId,
    `/uploads/${filename}`,
    kind === "test" ? "test" : "pour"
  )
  if (typeof lang === "string") revalidatePath(`/${lang}`)
}
