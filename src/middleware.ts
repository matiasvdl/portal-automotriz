import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { client } from '@/sanity/lib/client'

// La exportación debe ser nombrada y llamarse exactamente 'middleware'
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Rutas que quedan fuera del bloqueo
    if (
        pathname.startsWith('/admin') ||
        pathname === '/mantenimiento' ||
        pathname.startsWith('/_next') ||
        pathname.includes('favicon.ico')
    ) {
        return NextResponse.next()
    }

    try {
        // 2. Consulta rápida a Sanity
        const settings = await client.fetch(`*[_id == "site-settings-config"][0]{maintenanceMode}`)

        // 3. Redirección si el modo está activo
        if (settings?.maintenanceMode === true) {
            return NextResponse.redirect(new URL('/mantenimiento', request.url))
        }
    } catch (error) {
        // Si falla la conexión a Sanity, permitimos el acceso para no bloquear el sitio por error
        console.error("Error en el middleware de VDL Motors:", error)
    }

    return NextResponse.next()
}

// Configuración del matcher (qué rutas interceptar)
export const config = {
    matcher: [
        /*
         * Intercepta todas las rutas excepto:
         * - api (rutas de API)
         * - archivos estáticos (css, js, etc)
         * - imágenes optimizadas
         * - favicon
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}