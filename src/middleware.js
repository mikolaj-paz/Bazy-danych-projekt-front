import { NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const adminRoutes = [
  '/dashboard',
  '/dashboard/naprawy',
  '/dashboard/mechanicy',
  '/dashboard/pojazdy',
  '/dashboard/klienci',
]
const workerRoutes = [
  '/naprawy'
]
const publicRoutes = ['/']
 
export default async function middleware(req) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isAdminRoute = adminRoutes.includes(path)
  const isWorkerRoute = workerRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  const isAdmin = session?.role === 'admin' ? true : false
 
  // 5. Redirect to / if the user is not authenticated
  if ((isAdminRoute || isWorkerRoute) && !session?.userID) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
  
  // 6. Redirect to proper page if the user is authenticated
  if (
    isPublicRoute &&
    session?.userID &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    if (isAdmin)
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    else
      return NextResponse.redirect(new URL('/naprawy', req.nextUrl))
  }

  // 7. Redirect to worker page if not an admin
  if (
    isAdminRoute &&
    !isAdmin
  ) {
    return NextResponse.redirect(new URL('/naprawy', req.nextUrl))
  }

  // 7. Redirect to admin page if not a worker
  if (
    isWorkerRoute &&
    isAdmin
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}