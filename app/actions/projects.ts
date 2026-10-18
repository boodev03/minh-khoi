"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { FormState } from "@/lib/definitions"
import { verifySession } from "@/lib/session"
import {
  addBuilding,
  addProject,
  removeBuilding,
  removeProject,
  renameBuilding,
  renameProject,
} from "@/lib/projects"

export type EntityResult = { error?: "required" | "notEmpty" }

async function requireSession() {
  if (!(await verifySession())) throw new Error("Unauthorized")
}

function done(lang: string): EntityResult {
  revalidatePath(`/${lang}`, "layout")
  return {}
}

export async function createProjectAction(
  name: string,
  lang: string
): Promise<EntityResult> {
  await requireSession()
  if (!name.trim()) return { error: "required" }
  await addProject(name)
  return done(lang)
}

export async function renameProjectAction(
  id: string,
  name: string,
  lang: string
): Promise<EntityResult> {
  await requireSession()
  if (!name.trim()) return { error: "required" }
  await renameProject(id, name)
  return done(lang)
}

export async function deleteProjectAction(
  id: string,
  lang: string
): Promise<EntityResult> {
  await requireSession()
  const error = await removeProject(id)
  return error ? { error } : done(lang)
}

export async function createBuildingAction(
  projectId: string,
  name: string,
  lang: string
): Promise<EntityResult> {
  await requireSession()
  if (!name.trim()) return { error: "required" }
  await addBuilding(projectId, name)
  return done(lang)
}

export async function renameBuildingAction(
  id: string,
  name: string,
  lang: string
): Promise<EntityResult> {
  await requireSession()
  if (!name.trim()) return { error: "required" }
  await renameBuilding(id, name)
  return done(lang)
}

export async function deleteBuildingAction(
  id: string,
  lang: string
): Promise<EntityResult> {
  await requireSession()
  const error = await removeBuilding(id)
  return error ? { error } : done(lang)
}

// Onboarding: first project for a user who has none, then open it.
export async function createFirstProjectAction(
  lang: string,
  state: FormState,
  formData: FormData
): Promise<FormState> {
  await requireSession()
  const name = String(formData.get("name") ?? "")
  const id = await addProject(name)
  if (!id) return { errors: { name: ["required"] } }
  revalidatePath(`/${lang}`, "layout")
  redirect(`/${lang}/projects/${id}`)
}
