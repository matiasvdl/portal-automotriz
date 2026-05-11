import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PRINCIPAL_ROLE = 'Administrador Principal'
const ADMIN_ROLE = 'Administrador'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Definimos que rutas son privadas.
    const isProtectedRoute = path.startsWith('/admin') && !path.startsWith('/admin/ingresar')
    const isPrincipalOnlyRoute = path.startsWith('/admin/administracion')
    const isAdminRoute = path.startsWith('/admin/preferencias')

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })
    const tokenRole = typeof token?.role === 'string' ? token.role : ''

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/admin/ingresar', request.url))
    }

    if (isPrincipalOnlyRoute && tokenRole !== PRINCIPAL_ROLE) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    if (isAdminRoute && tokenRole !== PRINCIPAL_ROLE && tokenRole !== ADMIN_ROLE) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')

    return response
}

export const config = {
    // Aplicar a todas las rutas de admin excepto el login
    matcher: ['/admin/:path*'],
}