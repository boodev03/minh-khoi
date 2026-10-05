"use server"

import { redirect } from "next/navigation"
import { LoginFormSchema, type FormState } from "@/lib/definitions"
import { createSession, deleteSession } from "@/lib/session"
import { verifyCredentials } from "@/lib/users"

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { username, password } = validatedFields.data
  const user = await verifyCredentials(username, password)

  if (!user) {
    return { message: "invalidCredentials" }
  }

  await createSession(user.id, user.username, user.role)
  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
