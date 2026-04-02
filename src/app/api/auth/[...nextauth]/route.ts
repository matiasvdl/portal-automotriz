import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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

                if (credentials?.username === ADMIN_USER && credentials?.password === ADMIN_PASSWORD) {
                    return { id: "1", name: "Matias", email: "admin@vdlmotors.cl" }
                }
                return null
            }
        })
    ],
    pages: {
        signIn: '/admin/ingresar',
    },
    secret: process.env.NEXTAUTH_SECRET || "vdl-secret-123", // Clave de emergencia por si no lee el .env
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }