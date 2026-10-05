import "server-only"

export type AuthUser = {
  id: string
  username: string
  role: string
}

// TODO: replace with a real user table (DB) with hashed passwords
// once persistence for the concrete QC app is added.
export async function verifyCredentials(
  username: string,
  password: string
): Promise<AuthUser | null> {
  const adminUser = process.env.AUTH_ADMIN_USERNAME ?? "admin"
  const adminPassword = process.env.AUTH_ADMIN_PASSWORD ?? "admin123"

  if (username === adminUser && password === adminPassword) {
    return { id: "1", username: adminUser, role: "admin" }
  }
  return null
}
