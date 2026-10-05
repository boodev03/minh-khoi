import * as z from "zod"

export const LoginFormSchema = z.object({
  username: z.string().min(1, { error: "usernameRequired" }).trim(),
  password: z.string().min(1, { error: "passwordRequired" }),
})

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

export const ElementFormSchema = z.object({
  name: z.string().min(1, { error: "required" }).trim(),
  pourDate: z.string().min(1, { error: "required" }),
  supplier: z.string().min(1, { error: "required" }),
  category: z.string().min(1, { error: "required" }),
  volume: z.coerce.number().positive({ error: "invalidNumber" }),
  curingDays: z.coerce
    .number()
    .int()
    .min(1, { error: "invalidNumber" })
    .max(30, { error: "invalidNumber" }),
  curingRemindersPerDay: z.coerce
    .number()
    .int()
    .min(0, { error: "invalidNumber" })
    .max(10, { error: "invalidNumber" }),
})
