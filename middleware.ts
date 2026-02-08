import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants"

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	/*
	 * Playwright starts the dev server and requires a 200 status to
	 * begin the tests, so this ensures that the tests can start
	 */
	if (pathname.startsWith("/ping")) {
		return new Response("pong", { status: 200 })
	}

	if (pathname.startsWith("/api/auth")) {
		return NextResponse.next()
	}

	const token = await getToken({
		req: request,
		secret: process.env.AUTH_SECRET,
		secureCookie: !isDevelopmentEnvironment
	})

	// Redirect all unauthenticated users to login page
	if (!token) {
		// Allow access to login and register pages for unauthenticated users
		if (["/", "/login", "/register"].includes(pathname)) {
			return NextResponse.next()
		}

		return NextResponse.redirect(new URL("/login", request.url))
	}

	const isGuest = guestRegex.test(token?.email ?? "")

	if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
		return NextResponse.redirect(new URL("/generate", request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/",
		"/chat/:id",
		"/api/:path*",
		"/login",
		"/register",

		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
	]
}
