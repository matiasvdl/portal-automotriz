import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Función auxiliar para generar el retraso de seguridad
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "VDL Admin",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                const ADMIN_USER = process.env.ADMIN_USER || "admin"
                const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "vdl2026"

                // 1. Si las credenciales coinciden, el acceso es instantáneo
                if (credentials?.username === ADMIN_USER && credentials?.password === ADMIN_PASSWORD) {
                    return { id: "1", name: "Matias", email: "admin@vdlmotors.cl" }
                }

                // 2. Si las credenciales fallan, activamos el "escudo de tiempo"
                // El servidor esperará 3 segundos antes de responder que la clave es incorrecta
                await delay(3000)

                return null
            }
        })
    ],
    pages: {
        signIn: '/admin/ingresar',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }