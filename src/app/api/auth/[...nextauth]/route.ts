import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { client } from "@/sanity/lib/client"
import bcrypt from "bcryptjs"

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "VDL Admin",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                try {
                    // Normalizamos el correo (minúsculas y sin espacios)
                    const searchEmail = credentials.username.toLowerCase().trim()

                    // Buscamos al usuario en Sanity por su correo
                    const user = await client.fetch(
                        `*[_type == "adminProfile" && lower(email) == $email][0]`,
                        { email: searchEmail },
                        { cache: 'no-store' }
                    )

                    // Verificamos si el usuario existe y si tiene una contraseña guardada
                    if (user && user.password) {
                        // Comparamos la clave ingresada con el hash guardado en Sanity
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials.password,
                            user.password
                        )

                        if (isPasswordCorrect) {
                            // Si es correcto, devolvemos los datos para crear la sesión
                            return {
                                id: user._id,
                                name: `${user.firstName} ${user.lastName}`,
                                email: user.email,
                            }
                        }
                    }

                    // Si falla, esperamos 3 segundos para prevenir ataques de fuerza bruta
                    await delay(3000)
                    return null

                } catch (error) {
                    console.error("Error en el proceso de autenticacion:", error)
                    await delay(3000)
                    return null
                }
            }
        })
    ],
    pages: {
        signIn: '/admin/ingresar',
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // Sesión activa por 24 horas
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }