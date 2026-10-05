import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { defaultLocale, hasLocale, locales } from "@/lib/i18n"

const publicRoutes = ["/login"]
const localeCookie = "NEXT_LOCALE"

function detectLocale(request: NextRequest) {
  const cookie = request.cookies.get(localeCookie)?.value
  if (cookie && hasLocale(cookie)) return cookie

  const accept = request.headers.get("accept-language")?.toLowerCase() ?? ""
  for (const locale of locales) {
    if (accept.includes(locale)) return locale
  }
  return defaultLocale
}

// Optimistic auth check only — the session is fully verified in server
// components/actions via verifySession().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const seg = pathname.split("/")[1]
  const hasSession = !!request.cookies.get("session")?.value

  // Missing locale prefix: detect locale, fold in the auth check so
  // unauthenticated users land on /{locale}/login in one hop.
  if (!hasLocale(seg)) {
    const locale = detectLocale(request)
    let path = pathname === "/" ? "" : pathname
    const isPublic = publicRoutes.includes(path)
    if (!hasSession && !isPublic) path = "/login"
    else if (hasSession && isPublic) path = ""

    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${path}`
    return NextResponse.redirect(url)
  }

  const path = pathname.slice(seg.length + 1) || "/"
  const isPublic = publicRoutes.includes(path)

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL(`/${seg}/login`, request.url))
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL(`/${seg}`, request.url))
  }

  const response = NextResponse.next()
  if (request.cookies.get(localeCookie)?.value !== seg) {
    response.cookies.set(localeCookie, seg, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}
