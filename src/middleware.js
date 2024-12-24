import { NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const protectedRoutes = [
  '/dashboard',
  '/dashboard/naprawy',
  '/dashboard/mechanicy',
  '/dashboard/pojazdy',
  '/dashboard/klienci',
]
const publicRoutes = ['/']
 
export default async function middleware(req) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  // 5. Redirect to / if the user is not authenticated
  if (isProtectedRoute && !session?.userID) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
  
  // 6. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.userID &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}