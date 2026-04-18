'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type FeedbackType = 'success' | 'error' | 'info' | 'warning'

type NotificationItem = {
    id: string
    type: FeedbackType
    title: string
    message: string
    eventKey: string
    routePath: string
    createdAt: number
    read: boolean
}

type ConfirmState = {
    title: string
    message: string
    confirmText: string
    cancelText: string
    tone: 'default' | 'danger'
}

type NotifyInput =
    | string
    | {
        type?: FeedbackType
        title?: string
        message: string
        autoCloseMs?: number
        sticky?: boolean
    }

type ConfirmInput =
    | string
    | {
        title?: string
        message: string
        confirmText?: string
        cancelText?: string
        tone?: 'default' | 'danger'
    }

type FeedbackContextValue = {
    notify: (input: NotifyInput) => void
    confirmAction: (input: ConfirmInput) => Promise<boolean>
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

const TYPE_STYLES: Record<FeedbackType, { badge: string; dot: string; title: string; subtitle: string }> = {
    success: {
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
        title: 'text-black',
        subtitle: 'text-zinc-800',
    },
    error: {
        badge: 'text-red-700 bg-red-50 border-red-200',
        dot: 'bg-red-500',
        title: 'text-black',
        subtitle: 'text-zinc-800',
    },
    warning: {
        badge: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
        title: 'text-black',
        subtitle: 'text-zinc-800',
    },
    info: {
        badge: 'text-zinc-700 bg-zinc-50 border-zinc-200',
        dot: 'bg-zinc-500',
        title: 'text-black',
        subtitle: 'text-zinc-800',
    },
}

function mapTypeTitle(type: FeedbackType) {
    if (type === 'success') return 'Completado'
    if (type === 'error') return 'Error'
    if (type === 'warning') return 'Atencion'
    return 'Notificacion'
}

function inferLegacyAlertType(message: string): FeedbackType {
    const normalized = message.toLowerCase()

    if (
        normalized.includes('error') ||
        normalized.includes('no se pudo') ||
        normalized.includes('fallo') ||
        normalized.includes('falló') ||
        normalized.includes('inval') ||
        normalized.includes('rechaz')
    ) {
        return 'error'
    }

    if (
        normalized.includes('atencion') ||
        normalized.includes('atención') ||
        normalized.includes('revisa') ||
        normalized.includes('faltan') ||
        normalized.includes('completa')
    ) {
        return 'warning'
    }

    if (
        normalized.includes('correctamente') ||
        normalized.includes('guardado') ||
        normalized.includes('actualizado') ||
        normalized.includes('publicado') ||
        normalized.includes('creado') ||
        normalized.includes('eliminado')
    ) {
        return 'success'
    }

    return 'info'
}

function resolveAutoCloseMs(type: FeedbackType, sticky?: boolean, provided?: number) {
    if (typeof provided === 'number') return provided
    if (sticky) return 0
    if (type === 'error') return 0
    if (type === 'warning') return 18000
    return 12000
}

function toCompactText(message: string) {
    return message.replace(/\s+/g, ' ').trim()
}

function summarizeAlertMessage(message: string) {
    const compact = toCompactText(message)
    const normalized = compact.toLowerCase().replace(/[.!?]+$/g, '')

    if (normalized === 'cambios guardados') return 'Los cambios se guardaron correctamente'
    if (normalized === 'error al guardar' || normalized === 'hubo un error al guardar') {
        return 'No se pudieron guardar los cambios'
    }
    if (normalized.includes('ajustes guardados correctamente')) return 'Ajustes guardados correctamente'
    if (normalized.includes('completa los campos')) return 'Completa los campos obligatorios'
    if (normalized.includes('faltan datos')) return 'Faltan datos obligatorios para continuar'
    if (normalized.includes('no se pudo eliminar')) return 'No se pudo eliminar el registro seleccionado'

    if (compact.length > 62) {
        return `${compact.slice(0, 59).trim()}...`
    }

    return compact
}

function deriveAlertTitle(type: FeedbackType, message: string) {
    const normalized = message.toLowerCase()

    if (normalized.includes('guard')) return type === 'error' ? 'Guardado fallido' : 'Guardado'
    if (normalized.includes('elimin')) return type === 'error' ? 'Eliminacion fallida' : 'Eliminacion'
    if (normalized.includes('actualiz')) return type === 'error' ? 'Actualizacion fallida' : 'Actualizacion'
    if (normalized.includes('public')) return type === 'error' ? 'Publicacion fallida' : 'Publicacion'
    if (normalized.includes('imagen') || normalized.includes('subir') || normalized.includes('cargar')) {
        return type === 'error' ? 'Carga de imagen fallida' : 'Imagen cargada'
    }
    if (normalized.includes('credencial') || normalized.includes('acceso')) {
        return type === 'error' ? 'Acceso denegado' : 'Acceso'
    }
    if (normalized.includes('completa') || normalized.includes('faltan')) return 'Datos incompletos'

    return mapTypeTitle(type)
}

function deriveEventKey(type: FeedbackType, title: string, message: string) {
    const normalized = `${title} ${message}`.toLowerCase()

    if (normalized.includes('guard')) return `${type}:guardado`
    if (normalized.includes('elimin')) return `${type}:eliminacion`
    if (normalized.includes('actualiz')) return `${type}:actualizacion`
    if (normalized.includes('public')) return `${type}:publicacion`
    if (normalized.includes('imagen') || normalized.includes('subir') || normalized.includes('cargar')) {
        return `${type}:imagen`
    }
    if (normalized.includes('acceso') || normalized.includes('credencial')) return `${type}:acceso`
    if (normalized.includes('completa') || normalized.includes('faltan')) return `${type}:datos`

    return `${type}:${normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
}

function normalizeNotifyInput(input: NotifyInput) {
    if (typeof input === 'string') {
        const inferredType = inferLegacyAlertType(input)
        const compactMessage = summarizeAlertMessage(input)
        const title = deriveAlertTitle(inferredType, compactMessage)
        return {
            type: inferredType,
            title,
            message: compactMessage,
            eventKey: deriveEventKey(inferredType, title, compactMessage),
            autoCloseMs: resolveAutoCloseMs(inferredType),
        }
    }

    const type = input.type || 'info'
    const compactMessage = summarizeAlertMessage(input.message)
    const title = input.title || deriveAlertTitle(type, compactMessage)
    return {
        type,
        title,
        message: compactMessage,
        eventKey: deriveEventKey(type, title, compactMessage),
        autoCloseMs: resolveAutoCloseMs(type, input.sticky, input.autoCloseMs),
    }
}

function normalizeConfirmInput(input: ConfirmInput): ConfirmState {
    if (typeof input === 'string') {
        return {
            title: 'Confirmar accion',
            message: input,
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            tone: 'danger',
        }
    }

    return {
        title: input.title || 'Confirmar accion',
        message: input.message,
        confirmText: input.confirmText || 'Confirmar',
        cancelText: input.cancelText || 'Cancelar',
        tone: input.tone || 'danger',
    }
}

export function AdminFeedbackProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [toastIds, setToastIds] = useState<string[]>([])
    const [panelOpen, setPanelOpen] = useState(false)
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
    const confirmResolverRef = useRef<((result: boolean) => void) | null>(null)

    const addNotification = useCallback((input: NotifyInput) => {
        const normalized = normalizeNotifyInput(input)
        const createdAt = Date.now()
        const duplicateWindowMs = 15000
        const routePath = pathname || '/'

        let notificationId = `${createdAt}-${Math.random().toString(36).slice(2, 8)}`

        setNotifications((prev) => {
            const duplicate = prev.find(
                (item) =>
                    item.eventKey === normalized.eventKey &&
                    item.routePath === routePath &&
                    createdAt - item.createdAt <= duplicateWindowMs
            )

            if (duplicate) {
                notificationId = duplicate.id
                return prev.map((item) =>
                    item.id === duplicate.id
                        ? { ...item, createdAt, read: false, message: normalized.message, title: normalized.title }
                        : item
                )
            }

            return [
                {
                    id: notificationId,
                    type: normalized.type,
                    title: normalized.title,
                    message: normalized.message,
                    eventKey: normalized.eventKey,
                    routePath,
                    createdAt,
                    read: false,
                },
                ...prev.slice(0, 149),
            ]
        })

        setToastIds((prev) => {
            const withoutCurrent = prev.filter((itemId) => itemId !== notificationId)
            return [notificationId, ...withoutCurrent].slice(0, 1)
        })

        if (normalized.autoCloseMs > 0) {
            window.setTimeout(() => {
                setToastIds((prev) => prev.filter((itemId) => itemId !== notificationId))
            }, normalized.autoCloseMs)
        }
    }, [pathname])

    const confirmAction = useCallback((input: ConfirmInput) => {
        const nextState = normalizeConfirmInput(input)
        setConfirmState(nextState)

        return new Promise<boolean>((resolve) => {
            confirmResolverRef.current = resolve
        })
    }, [])

    const handleConfirmResolve = useCallback((result: boolean) => {
        setConfirmState(null)
        if (confirmResolverRef.current) {
            confirmResolverRef.current(result)
            confirmResolverRef.current = null
        }
    }, [])

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    }, [])

    const clearNotifications = useCallback(() => {
        setNotifications([])
        setToastIds([])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToastIds((prev) => prev.filter((itemId) => itemId !== id))
    }, [])

    useEffect(() => {
        const originalAlert = window.alert
        const originalConfirm = window.confirm
        window.alert = (message?: unknown) => {
            const safeMessage = typeof message === 'string' ? message : String(message ?? '')
            addNotification(safeMessage)
        }
        window.confirm = () => true

        return () => {
            window.alert = originalAlert
            window.confirm = originalConfirm
        }
    }, [addNotification])

    const unreadCount = notifications.filter((item) => !item.read).length
    const visibleToasts = toastIds
        .map((id) => notifications.find((item) => item.id === id))
        .filter((item): item is NotificationItem => Boolean(item))

    const contextValue = useMemo<FeedbackContextValue>(() => ({
        notify: addNotification,
        confirmAction,
    }), [addNotification, confirmAction])

    const hideFeedbackUi = pathname === '/admin/ingresar'

    return (
        <FeedbackContext.Provider value={contextValue}>
            {children}

            {!hideFeedbackUi ? (
                <div className="fixed bottom-4 right-4 z-[80]">
                    <div className="relative flex flex-col items-end">
                        {visibleToasts.length > 0 ? (
                            <div className="grid w-[320px] grid-cols-1 gap-2">
                                {visibleToasts.map((toast) => (
                                    <div key={toast.id} className="w-full rounded-xl border border-gray-100 bg-white p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <span className={`inline-flex h-1.5 w-1.5 rounded-full ${TYPE_STYLES[toast.type].dot}`}></span>
                                                <div className="flex min-w-0 flex-col justify-center text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-black leading-none">
                                                        {toast.title}
                                                    </p>
                                                    <p className="mt-[7px] text-[8px] font-bold uppercase tracking-tighter text-zinc-400 leading-none">
                                                        {toast.message}
                                                    </p>
                                                    <p className="mt-[6px] text-[8px] font-bold uppercase tracking-tighter text-zinc-500 leading-none">
                                                        Ruta: {toast.routePath}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeToast(toast.id)}
                                                className="rounded-full p-1 text-zinc-400 transition-none hover:bg-zinc-100 hover:text-zinc-700"
                                                aria-label="Cerrar aviso"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                    <path d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {!panelOpen && visibleToasts.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    markAllRead()
                                    setPanelOpen(true)
                                }}
                                className="relative inline-flex h-12 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.4">
                                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-black px-1.5 text-[9px] font-black text-white leading-[18px]">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                ) : null}
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {panelOpen && !hideFeedbackUi ? (
                <div className="fixed inset-0 z-[75] bg-transparent" onClick={() => setPanelOpen(false)}>
                    <div
                        className="absolute bottom-4 right-4 w-[360px] max-h-[70vh] overflow-hidden rounded-3xl border border-gray-200 bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Notificaciones</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={clearNotifications}
                                    className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[56vh] overflow-y-auto px-3 py-3 space-y-2">
                            {notifications.length === 0 ? (
                                <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-5 text-left">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Sin notificaciones</p>
                                    <p className="mt-1 text-[10px] font-medium text-zinc-500">Aqui apareceran las alertas del panel</p>
                                </div>
                            ) : (
                                notifications.map((item) => (
                                    <div key={item.id} className={`rounded-2xl border px-3 py-3 text-left ${item.read ? 'border-gray-100 bg-[#F7F8FA]' : 'border-zinc-200 bg-white'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-widest ${TYPE_STYLES[item.type].badge}`}>
                                                {item.title}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                                                {new Date(item.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] font-medium leading-relaxed text-zinc-700">{item.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {confirmState ? (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-transparent px-4">
                    <div className="w-full max-w-md rounded-3xl border border-gray-300 bg-white p-6 text-left">
                        <h3 className="text-[14px] font-black uppercase tracking-tight text-black">{confirmState.title}</h3>
                        <p className="mt-3 text-[12px] font-medium leading-relaxed text-zinc-600">{confirmState.message}</p>
                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => handleConfirmResolve(false)}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600"
                            >
                                {confirmState.cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmResolve(true)}
                                className={`rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-white ${confirmState.tone === 'danger' ? 'bg-black' : 'bg-zinc-700'}`}
                            >
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </FeedbackContext.Provider>
    )
}

export function useAdminFeedback() {
    const context = useContext(FeedbackContext)
    if (!context) {
        throw new Error('useAdminFeedback debe usarse dentro de AdminFeedbackProvider')
    }
    return context
}
