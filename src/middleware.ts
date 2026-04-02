import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Definimos qué rutas son privadas
    const isProtectedRoute = path.startsWith('/admin') && !path.startsWith('/admin/ingresar')

    // Aquí revisamos la cookie de sesión (NextAuth o tu sistema de login)
    // Ajusta 'next-auth.session-token' si usas otro nombre
    const session = request.cookies.get('next-auth.session-token') ||
        request.cookies.get('__Secure-next-auth.session-token')

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/admin/ingresar', request.url))
    }

    return NextResponse.next()
}

export const config = {
    // Aplicar a todas las rutas de admin excepto el login
    matcher: ['/admin/:path*'],
}