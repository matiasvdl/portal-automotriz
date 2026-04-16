'use server'

import { Resend } from 'resend'
import { headers } from 'next/headers'
import { client } from '@/sanity/lib/client'
import { recordAuditLog } from '@/lib/audit'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FALLBACK = ['matiasvidalp49@gmail.com']
const REQUEST_WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 3
const requestTracker = new Map<string, number[]>()
const RECOVERY_REQUEST_WINDOW_MS = 10 * 60_000
const MAX_RECOVERY_REQUESTS_PER_WINDOW = 3
const recoveryRequestTracker = new Map<string, number[]>()

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function sanitizeText(value: string, maxLength: number) {
    return escapeHtml(value.trim().slice(0, maxLength))
}

async function getRequestIdentifier() {
    const headerStore = await headers()
    const forwardedFor = headerStore.get('x-forwarded-for')
    const realIp = headerStore.get('x-real-ip')

    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
}

function isRateLimited(identifier: string) {
    const now = Date.now()
    const recentRequests = (requestTracker.get(identifier) || []).filter(
        (timestamp) => now - timestamp < REQUEST_WINDOW_MS
    )

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        requestTracker.set(identifier, recentRequests)
        return true
    }

    recentRequests.push(now)
    requestTracker.set(identifier, recentRequests)
    return false
}

function isRecoveryRateLimited(identifier: string) {
    const now = Date.now()
    const recentRequests = (recoveryRequestTracker.get(identifier) || []).filter(
        (timestamp) => now - timestamp < RECOVERY_REQUEST_WINDOW_MS
    )

    if (recentRequests.length >= MAX_RECOVERY_REQUESTS_PER_WINDOW) {
        recoveryRequestTracker.set(identifier, recentRequests)
        return true
    }

    recentRequests.push(now)
    recoveryRequestTracker.set(identifier, recentRequests)
    return false
}

export async function sendContactEmail(formData: {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}) {
    try {
        const requestIdentifier = await getRequestIdentifier()

        if (isRateLimited(requestIdentifier)) {
            return { success: false, error: 'Demasiados intentos. Intenta nuevamente en un minuto.' }
        }

        if (!process.env.RESEND_API_KEY) {
            return { success: false, error: 'Servicio de correo no configurado' }
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const rawName = formData.name?.trim() || ''
        const rawEmail = formData.email?.trim() || ''
        const rawPhone = formData.phone?.trim() || ''
        const rawSubject = formData.subject?.trim() || ''
        const rawMessage = formData.message?.trim() || ''

        if (!rawName || !rawEmail || !rawMessage) {
            return { success: false, error: 'Faltan campos obligatorios' }
        }

        if (!emailPattern.test(rawEmail)) {
            return { success: false, error: 'Correo inválido' }
        }

        const name = sanitizeText(rawName, 120)
        const email = sanitizeText(rawEmail, 160)
        const phone = sanitizeText(rawPhone, 40)
        const subject = sanitizeText(rawSubject || 'Consulta General', 120)
        const message = sanitizeText(rawMessage, 5000).replace(/\n/g, '<br />')

        // Traemos los correos de notificación desde Sanity
        const contactConfig = await client.fetch(
            `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`
        )
        const recipients = contactConfig?.notificationEmails?.length > 0
            ? contactConfig.notificationEmails
            : EMAIL_FALLBACK

        const { data, error } = await resend.emails.send({
            from: 'VDL Motors <onboarding@resend.dev>',
            to: recipients,
            subject: `Consulta Web: ${subject} - ${name}`,
            replyTo: email,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #000; text-transform: uppercase;">Nueva Consulta</h2>
                    <hr />
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email del Cliente:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    <p><strong>Asunto:</strong> ${subject}</p>
                    <div style="background: #f9f9f9; padding: 15px; margin-top: 15px; border-radius: 5px;">
                        <strong>Mensaje:</strong><br />${message}
                    </div>
                </div>
            `
        })

        if (error) return { success: false, error }
        return { success: true, data }
    } catch (error) {
        console.error('Error enviando email:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}

export async function requestAdminPasswordRecovery(formData: {
    identifier: string
    fullName: string
    contactEmail: string
    phone?: string
    message?: string
}) {
    try {
        const requestIdentifier = await getRequestIdentifier()

        if (isRecoveryRateLimited(requestIdentifier)) {
            return {
                success: true,
                message: 'Si los datos son válidos, enviaremos tu solicitud de recuperación al soporte.'
            }
        }

        if (!process.env.RESEND_API_KEY) {
            return { success: false, error: 'Servicio de correo no configurado' }
        }

        const cleanedIdentifier = formData.identifier.trim().toLowerCase()
        const cleanedFullName = formData.fullName.trim()
        const cleanedContactEmail = formData.contactEmail.trim().toLowerCase()
        const cleanedPhone = (formData.phone || '').trim()
        const cleanedMessage = (formData.message || '').trim()
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!cleanedIdentifier) {
            return { success: false, error: 'Ingresa tu usuario o correo.' }
        }

        if (!cleanedFullName) {
            return { success: false, error: 'Ingresa tu nombre.' }
        }

        if (!cleanedContactEmail || !emailPattern.test(cleanedContactEmail)) {
            return { success: false, error: 'Ingresa un correo de contacto válido.' }
        }

        const contactConfig = await client.fetch(
            `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`
        )
        const recipients = contactConfig?.notificationEmails?.length > 0
            ? contactConfig.notificationEmails
            : EMAIL_FALLBACK

        const matchedUser = await client.fetch(
            `*[_type == "adminProfile" && (lower(email) == $identifier || lower(username) == $identifier)][0]{
                _id,
                firstName,
                lastName,
                username,
                email,
                role
            }`,
            { identifier: cleanedIdentifier },
            { cache: 'no-store' }
        )

        const matchedName = matchedUser
            ? `${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`.trim()
            : ''

        const statusLabel = matchedUser ? 'Coincidencia encontrada' : 'Sin coincidencia exacta'

        const { error } = await resend.emails.send({
            from: 'VDL Motors <onboarding@resend.dev>',
            to: recipients,
            subject: 'Solicitud de recuperación de acceso al panel',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #000; text-transform: uppercase;">Recuperación de acceso</h2>
                    <hr />
                    <p><strong>Nombre de contacto:</strong> ${escapeHtml(cleanedFullName)}</p>
                    <p><strong>Correo de contacto:</strong> ${escapeHtml(cleanedContactEmail)}</p>
                    <p><strong>Teléfono:</strong> ${escapeHtml(cleanedPhone || 'No informado')}</p>
                    <p><strong>Identificador ingresado:</strong> ${escapeHtml(cleanedIdentifier)}</p>
                    <p><strong>Resultado interno:</strong> ${statusLabel}</p>
                    ${matchedUser ? `
                        <p><strong>Usuario:</strong> ${escapeHtml(matchedName || matchedUser.username || 'Sin nombre')}</p>
                        <p><strong>Correo:</strong> ${escapeHtml(matchedUser.email || 'Sin correo')}</p>
                        <p><strong>Rol:</strong> ${escapeHtml(matchedUser.role || 'Sin rol')}</p>
                    ` : ''}
                    <div style="background: #f9f9f9; padding: 15px; margin-top: 15px; border-radius: 5px;">
                        <strong>Mensaje:</strong><br />${escapeHtml(cleanedMessage || 'Sin detalle adicional').replace(/\n/g, '<br />')}
                    </div>
                    <p><strong>IP de solicitud:</strong> ${escapeHtml(requestIdentifier)}</p>
                    <p style="margin-top: 16px; color: #666;">
                        El usuario no ve el correo de destino. Esta notificación es solo interna.
                    </p>
                </div>
            `
        })

        if (error) {
            return { success: false, error: 'No se pudo enviar la solicitud.' }
        }

        await recordAuditLog({
            adminId: matchedUser?._id,
            adminName: matchedName || matchedUser?.username || cleanedIdentifier,
            adminEmail: matchedUser?.email || null,
            action: 'password_recovery_request',
            entityType: 'auth',
            entityId: matchedUser?._id || '',
            entityTitle: matchedUser?.username || cleanedIdentifier,
            message: matchedUser
                ? 'Se solicitó recuperación de acceso para este usuario.'
                : 'Se recibió una solicitud de recuperación sin coincidencia exacta.',
            metadata: {
                requestIdentifier,
                matched: Boolean(matchedUser),
                submittedIdentifier: cleanedIdentifier,
                fullName: cleanedFullName,
                contactEmail: cleanedContactEmail,
                phone: cleanedPhone,
            },
        })

        return {
            success: true,
            message: 'Si los datos son válidos, enviaremos tu solicitud de recuperación al soporte.'
        }
    } catch (error) {
        console.error('Error solicitando recuperación:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}
