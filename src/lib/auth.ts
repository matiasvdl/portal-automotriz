import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const PRINCIPAL_ROLE = 'Administrador Principal'
export const ADMIN_ROLE = 'Administrador'

type SessionUser = Session['user'] & {
    id?: string
    role?: string
    email?: string | null
}

export async function getAuthenticatedSession() {
    return getServerSession(authOptions)
}

export async function requireAuthenticatedSession() {
    const session = await getAuthenticatedSession()

    if (!session?.user) {
        throw new Error('No autorizado')
    }

    return session
}

export async function requireAdminSession() {
    const session = await requireAuthenticatedSession()
    const role = (session.user as SessionUser).role

    if (role !== PRINCIPAL_ROLE && role !== ADMIN_ROLE) {
        throw new Error('No autorizado')
    }

    return session
}

export async function requirePrincipalSession() {
    const session = await requireAuthenticatedSession()
    const role = (session.user as SessionUser).role

    if (role !== PRINCIPAL_ROLE) {
        throw new Error('No autorizado')
    }

    return session
}

export function getSessionUser(session: Session) {
    return session.user as SessionUser
}
