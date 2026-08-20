import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth)
  const { pathname, searchParams } = req.nextUrl

  const isProtected = pathname.startsWith("/dashboard")

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Someone already signed in has no use for the sign-up form, and normally no
  // use for the sign-in form either — send them to their dashboard.
  //
  // Two exceptions, both cases where hiding the form is the wrong answer:
  //
  //   - ?portal= means they deliberately asked for a specific door. The staff
  //     and customer portals are separate accounts, so a signed-in staff member
  //     following the "Customer sign in" link needs the form, not a bounce.
  //   - ?reason= is the redirect out of /logout. Bouncing it would hide the
  //     explanation for why they were signed out.
  const askedForAPortal = searchParams.has("portal") || searchParams.has("reason")

  if (isLoggedIn && pathname === "/login" && !askedForAPortal) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }
  if (isLoggedIn && pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
