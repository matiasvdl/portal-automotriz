import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Definimos qué rutas son privadas
    const isProtectedRoute = path.startsWith('/admin') && !path.startsWith('/admin/ingresar')

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/admin/ingresar', request.url))
    }

    return NextResponse.next()
}

export const config = {
    // Aplicar a todas las rutas de admin excepto el login
    matcher: ['/admin/:path*'],
}
