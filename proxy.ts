import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isPortalRoute = createRouteMatcher(['/portal(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const loginUrl = new URL('/id', req.url)
      loginUrl.searchParams.set('redirect_url', `${req.nextUrl.pathname}${req.nextUrl.search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isPortalRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const loginUrl = new URL('/id', req.url)
      loginUrl.searchParams.set('redirect_url', `${req.nextUrl.pathname}${req.nextUrl.search}`)
      return NextResponse.redirect(loginUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
