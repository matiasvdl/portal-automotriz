'use server'

import { getSessionUser, requireAuthenticatedSession } from '@/lib/auth'
import { writeClient } from '@/sanity/lib/client'

type AuditEntityType =
    | 'auth'
    | 'usuario'
    | 'vehiculo'
    | 'preferencias'
    | 'contenido'
    | 'marca'

type AuditLogPayload = {
    adminId?: string
    adminName?: string
    adminEmail?: string | null
    action: string
    entityType: AuditEntityType
    entityId?: string
    entityTitle?: string
    message: string
    metadata?: Record<string, unknown>
}

function normalizeName(name?: string | null, email?: string | null) {
    if (name?.trim()) return name.trim()
    if (email?.trim()) return email.trim()
    return 'Usuario'
}

export async function recordAuditLog(payload: AuditLogPayload) {
    try {
        await writeClient.create({
            _type: 'auditLog',
            admin: payload.adminId
                ? {
                    _type: 'reference',
                    _ref: payload.adminId,
                }
                : undefined,
            adminName: normalizeName(payload.adminName, payload.adminEmail),
            adminEmail: payload.adminEmail || '',
            action: payload.action,
            entityType: payload.entityType,
            entityId: payload.entityId || '',
            entityTitle: payload.entityTitle || '',
            message: payload.message,
            metadata: payload.metadata,
            eventAt: new Date().toISOString(),
        })
    } catch (error) {
        console.error('recordAuditLog:', error)
    }
}

export async function recordAuditLogFromSession(
    payload: Omit<AuditLogPayload, 'adminId' | 'adminName' | 'adminEmail'>
) {
    try {
        const session = await requireAuthenticatedSession()
        const user = getSessionUser(session)

        await recordAuditLog({
            ...payload,
            adminId: user.id,
            adminName: session.user?.name || user.username || user.email || 'Usuario',
            adminEmail: user.email,
        })
    } catch (error) {
        console.error('recordAuditLogFromSession:', error)
    }
}
