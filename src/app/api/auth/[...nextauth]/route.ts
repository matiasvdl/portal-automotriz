import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { client, writeClient } from "@/sanity/lib/client"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"
import { recordAuditLog } from "@/lib/audit"

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
const LOGIN_WINDOW_MS = 10 * 60_000
const LOGIN_MAX_ATTEMPTS = 5
const loginAttemptTracker = new Map<string, number[]>()
const isProd = process.env.NODE_ENV === 'production'
const secureCookiePrefix = isProd ? '__Secure-' : ''

async function getRequestIdentifier() {
    const headerStore = await headers()
    const forwardedFor = headerStore.get('x-forwarded-for')
    const realIp = headerStore.get('x-real-ip')

    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
}

function isLoginRateLimited(identifier: string) {
    const now = Date.now()
    const recentAttempts = (loginAttemptTracker.get(identifier) || []).filter(
        (timestamp) => now - timestamp < LOGIN_WINDOW_MS
    )

    if (recentAttempts.length >= LOGIN_MAX_ATTEMPTS) {
        loginAttemptTracker.set(identifier, recentAttempts)
        return true
    }

    recentAttempts.push(now)
    loginAttemptTracker.set(identifier, recentAttempts)
    return false
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Panel Admin",
            credentials: {
                username: { label: "Usuario o Email", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                try {
                    const identifier = credentials.username.toLowerCase().trim()
                    const requestIdentifier = await getRequestIdentifier()
                    const attemptKey = `${requestIdentifier}:${identifier}`

                    if (isLoginRateLimited(attemptKey)) {
                        await delay(3000)
                        return null
                    }

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
                            const loginAt = new Date().toISOString()

                            try {
                                await writeClient.patch(user._id).set({ lastLogin: loginAt }).commit()
                                await recordAuditLog({
                                    adminId: user._id,
                                    adminName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email,
                                    adminEmail: user.email,
                                    action: 'login',
                                    entityType: 'auth',
                                    entityId: user._id,
                                    entityTitle: user.username || user.email,
                                    message: 'Inició sesión en el panel administrativo.',
                                    metadata: {
                                        role: user.role || '',
                                        requestIdentifier,
                                    },
                                })
                            } catch (auditError) {
                                console.error('Error registrando inicio de sesión:', auditError)
                            }

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
                    console.error("Error en el proceso de autenticación:", error)
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
        maxAge: 8 * 60 * 60,
        updateAge: 60 * 60,
    },
    jwt: {
        maxAge: 8 * 60 * 60,
    },
    useSecureCookies: isProd,
    cookies: {
        sessionToken: {
            name: `${secureCookiePrefix}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: isProd,
            },
        },
        callbackUrl: {
            name: `${secureCookiePrefix}next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: isProd,
            },
        },
        csrfToken: {
            name: `${isProd ? '__Host-' : ''}next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: isProd,
            },
        },
    },
    trustHost: true,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id ?? ""
                session.user.role = token.role
                session.user.username = token.username
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
