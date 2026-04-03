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
                username: { label: "Usuario o Email", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                try {
                    // Normalizamos el identificador (puede ser username o email)
                    const identifier = credentials.username.toLowerCase().trim()

                    // Buscamos al usuario en Sanity por email O por username
                    const user = await client.fetch(
                        `*[_type == "adminProfile" && (lower(email) == $identifier || lower(username) == $identifier)][0]`,
                        { identifier },
                        { cache: 'no-store' }
                    )

                    if (user && user.password) {
                        const isPasswordCorrect = await bcrypt.compare(
                            credentials.password,
                            user.password
                        )

                        if (isPasswordCorrect) {
                            return {
                                id: user._id,
                                name: `${user.firstName} ${user.lastName}`,
                                email: user.email,
                                role: user.role,
                                username: user.username
                            }
                        }
                    }

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
        maxAge: 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).username = token.username;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }