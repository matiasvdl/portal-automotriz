'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import AdminNavigation from '@/components/AdminNavigation'
import AdminSoftSelect from '@/components/AdminSoftSelect'
import SoftDateInput from '@/components/SoftDateInput'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import {
    uploadSanityImage,
    saveGlobalPreferences,
    createSanityDocument,
    deleteSanityDocument,
    updateSanityDocument
} from '@/app/actions/preferencesActions'
import { deleteBrandAction, deleteBrandModelAction } from '@/app/actions/brandActions'
import { urlFor } from '@/sanity/lib/image'
import {
    ACCESSIBILITY_SCALE_MAX,
    ACCESSIBILITY_SCALE_MIN,
    ACCESSIBILITY_SCALE_STEP,
    CONTENT_DEFAULTS,
    clampAccessibilityScale,
    clampLogoMaxHeightPx,
    LOGO_MAX_HEIGHT_MAX_PX,
    LOGO_MAX_HEIGHT_MIN_PX,
    LOGO_MAX_HEIGHT_STEP_PX,
    resolveAccessibilityScale,
    resolveLogoMaxHeightPx,
} from '@/lib/content-defaults'

type SessionUser = {
    role?: string
}

type SanityAssetReference = {
    _type: 'reference'
    _ref: string
}

type SanityImageValue = {
    _type: 'image'
    asset: SanityAssetReference
}

type SanityFaqDocument = {
    _id: string
    question: string
    answer: string
    order?: number
}

type SanityReviewDocument = {
    _id: string
    name: string
    date: string
    rating: number
    comment: string
    badge: string
}

type ReviewItem = {
    _id: string
    name: string
    date: string
    rating: number
    comment: string
    badge: string
}

type FaqItem = {
    _id: string
    question: string
    answer: string
    order?: number
}

type AppearanceState = {
    _id: string
    brandName: string
    primaryColor: string
    accessibilityScale: number
    logo: SanityImageValue | File | null
    logoWidth: number
    favicon: SanityImageValue | File | null
    splitText: boolean
    isJoined: boolean
    minDepositPercent: number
    minIncome: number
    minWorkExperience: string
    heroTitle: string
    heroSubtitle: string
    heroPosition: string
    heroImage: SanityImageValue | File | null
}

const LOGO_SIZE_PRESETS: { label: string; value: number }[] = [
    { label: 'Compacto', value: 52 },
    { label: 'Medio', value: 60 },
    { label: 'Estándar', value: 64 },
    { label: 'Destacado', value: 72 },
]

// --- INTERFACES ---
interface NavItem {
    _key: string;
    title: string;
    path: string;
}

interface RutaOption {
    title: string;
    value: string;
}

type BrandModel = {
    _key: string
    modelName: string
    versions?: string[]
}

type BrandEntry = {
    _id: string
    name: string
    models?: BrandModel[]
}

// Añadimos pestañas nuevas de configuración
type TabType = 'general' | 'personalizacion' | 'navegacion' | 'financiamiento' | 'resenas' | 'contacto' | 'preguntas' | 'legales' | 'seo' | 'marcas';
const TABS: TabType[] = ['general', 'personalizacion', 'navegacion', 'financiamiento', 'contacto', 'preguntas', 'resenas', 'seo', 'marcas', 'legales']

function isSanityImageValue(value: SanityImageValue | File | null | undefined): value is SanityImageValue {
    return Boolean(
        value &&
        !(value instanceof File) &&
        value._type === 'image' &&
        value.asset?._type === 'reference' &&
        typeof value.asset?._ref === 'string'
    )
}

function createImageReference(assetId: string): SanityImageValue {
    return {
        _type: 'image',
        asset: {
            _type: 'reference',
            _ref: assetId,
        },
    }
}

function toFaqItem(document: SanityFaqDocument): FaqItem {
    return {
        _id: document._id,
        question: document.question,
        answer: document.answer,
        order: document.order,
    }
}

function toReviewItem(document: SanityReviewDocument): ReviewItem {
    return {
        _id: document._id,
        name: document.name,
        date: document.date,
        rating: document.rating,
        comment: document.comment,
        badge: document.badge,
    }
}

export default function PreferenciasPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('general')

    const [settings, setSettings] = useState({
        _id: '',
        siteName: '',
        siteUrl: '',
        footerDescription: '',
        footerTagline: '',
        navMenu: [] as NavItem[],
        footerLinks: [] as NavItem[],
        maintenanceMode: false,
        termsAndConditions: '',
        lastLegalUpdate: '',
        // BLOQUE SEO: Campos para Google
        seoDescriptions: {
            home: '',
            catalogo: '',
            vender: '',
            financiamiento: '',
            contacto: '',
            faq: '',
            terminos: ''
        }
    })

    const [appearanceData, setAppearanceData] = useState<AppearanceState>({
        _id: 'appearance-settings',
        brandName: '',
        primaryColor: '#000000',
        accessibilityScale: CONTENT_DEFAULTS.accessibilityScale,
        logo: null,
        logoWidth: clampLogoMaxHeightPx(CONTENT_DEFAULTS.logoMaxHeightPx),
        favicon: null,
        splitText: true,
        isJoined: false,
        minDepositPercent: 30,
        minIncome: 500000,
        minWorkExperience: '',
        heroTitle: 'TRANSFORMA TU CAMINO',
        heroSubtitle: 'Comprar y vender un auto nunca fue tan simple.',
        heroPosition: 'center',
        heroImage: null
    })

    const [contact, setContact] = useState({
        _id: 'global-contact',
        whatsapp: '',
        email: '',
        address: ''
    })

    const [allReviews, setAllReviews] = useState<ReviewItem[]>([])
    const [faqs, setFaqs] = useState<FaqItem[]>([])
    const [brands, setBrands] = useState<BrandEntry[]>([])
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 0 })

    const [newReview, setNewReview] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        rating: 5,
        comment: '',
        badge: 'Comprador Satisfecho'
    })

    const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
    const [editFaqForm, setEditFaqForm] = useState({ question: '', answer: '', order: 0 })
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', date: '', rating: 5, comment: '', badge: '' })

    const handleSiteNameChange = (value: string) => {
        setSettings(prev => ({ ...prev, siteName: value }))
        setAppearanceData(prev => ({ ...prev, brandName: value }))
    }

    const loadBrands = async () => {
        const brandList = await client.fetch<BrandEntry[]>(
            `*[_type == "brand"] | order(name asc){
                _id,
                name,
                models
            }`,
            {},
            { cache: 'no-store' }
        )
        setBrands(brandList)
    }

    // --- EFECTO DE SEGURIDAD ---
    useEffect(() => {
        if (status === 'authenticated') {
            const userRole = (session?.user as SessionUser | undefined)?.role
            if (userRole !== 'Administrador Principal' && userRole !== 'Administrador') {
                router.push('/admin/dashboard')
            }
        }
    }, [session, status, router])

    // CARGA DE DATOS
    useEffect(() => {
        const fetchSanityData = async () => {
            try {
                const [config, reviews, contactData, faqData, appearance] = await Promise.all([
                    client.fetch(`*[_type == "siteConfig"][0]`, {}, { cache: 'no-store' }),
                    client.fetch(`*[_type == "review"] | order(date desc)`, {}, { cache: 'no-store' }),
                    client.fetch(
                        `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`,
                        {},
                        { cache: 'no-store' }
                    ),
                    client.fetch(`*[_type == "faq"] | order(order asc)`, {}, { cache: 'no-store' }),
                    client.fetch(`*[_id == "appearance-settings"][0]`, {}, { cache: 'no-store' })
                ]);

                const unifiedSiteName = (config?.siteName || appearance?.brandName || '').trim()

                if (config) {
                    setSettings({
                        _id: config._id,
                        siteName: unifiedSiteName,
                        siteUrl: config.siteUrl || '',
                        footerDescription: config.footerDescription || '',
                        footerTagline: config.footerTagline || '',
                        navMenu: config.navMenu || [],
                        footerLinks: config.footerLinks || [],
                        maintenanceMode: config.maintenanceMode || false,
                        termsAndConditions: config.termsAndConditions || '',
                        lastLegalUpdate: config.lastLegalUpdate || '',
                        // Sincronizamos las descripciones SEO
                        seoDescriptions: config.seoDescriptions || {
                            home: '', catalogo: '', vender: '', financiamiento: '', contacto: '', faq: '', terminos: ''
                        }
                    })
                }

                if (appearance) {
                    setAppearanceData({
                        _id: appearance._id || 'appearance-settings',
                        brandName: appearance.brandName || config?.siteName || '',
                        logo: appearance.logo || null,
                        logoWidth: resolveLogoMaxHeightPx(appearance.logoWidth),
                        primaryColor: appearance.primaryColor || '#000000',
                        accessibilityScale: resolveAccessibilityScale(appearance.accessibilityScale),
                        favicon: appearance.favicon || null,
                        splitText: appearance.splitText !== undefined ? appearance.splitText : true,
                        isJoined: appearance.isJoined || false,
                        minDepositPercent: appearance.minDepositPercent || 30,
                        minIncome: appearance.minIncome || 500000,
                        minWorkExperience: appearance.minWorkExperience || '',
                        heroTitle: appearance.hero?.title || 'TRANSFORMA TU CAMINO',
                        heroSubtitle: appearance.hero?.subtitle || 'Comprar y vender un auto nunca fue tan simple.',
                        heroPosition: appearance.hero?.position || 'center',
                        heroImage: appearance.hero?.image || null
                    })
                }

                if (reviews) setAllReviews(reviews)
                if (faqData) setFaqs(faqData)
                await loadBrands()
                if (contactData) {
                    setContact({
                        _id: contactData._id || 'global-contact',
                        whatsapp: contactData.whatsapp || '',
                        email: contactData.email || '',
                        address: contactData.address || ''
                    })
                }
            } catch (error) { console.error(error) }
        }
        fetchSanityData()
    }, [])

    const handleDeleteBrand = async (brand: BrandEntry) => {
        if (!confirm(`¿Eliminar la marca ${brand.name}?`)) return

        setIsSubmitting(true)
        try {
            const result = await deleteBrandAction(brand.name)
            if (!result.success) {
                alert(result.error || 'No se pudo eliminar la marca')
                return
            }

            await loadBrands()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteModel = async (brandName: string, modelName: string) => {
        if (!confirm(`¿Eliminar el modelo ${modelName} de ${brandName}?`)) return

        setIsSubmitting(true)
        try {
            const result = await deleteBrandModelAction(brandName, modelName)
            if (!result.success) {
                alert(result.error || 'No se pudo eliminar el modelo')
                return
            }

            await loadBrands()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const result = await uploadSanityImage(formData)
            if (result.success && result.assetId) {
                setAppearanceData(prev => ({
                    ...prev,
                    logo: { _type: 'image', asset: { _type: "reference", _ref: result.assetId } }
                }))
                alert("Imagen cargada con éxito. Recuerda guardar los cambios globales.")
            } else {
                alert("Error: El servidor no pudo procesar la imagen.")
            }
        } catch (error) {
            console.error("Error al subir logo:", error)
            alert("Error al subir imagen")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveGlobal = async () => {
        setIsSubmitting(true)
        try {
            // 1. Subir Hero si es nuevo
            let heroImageRef = appearanceData.heroImage;
            if (appearanceData.heroImage instanceof File) {
                const formData = new FormData();
                formData.append('file', appearanceData.heroImage);
                const result = await uploadSanityImage(formData);
                if (result.success && result.assetId) {
                    heroImageRef = createImageReference(result.assetId)
                }
            }

            // 2. Subir Logo si es nuevo (ESTO FALTABA)
            let logoRef = appearanceData.logo;
            if (appearanceData.logo instanceof File) {
                const formData = new FormData();
                formData.append('file', appearanceData.logo);
                const result = await uploadSanityImage(formData);
                if (result.success && result.assetId) {
                    logoRef = createImageReference(result.assetId)
                }
            }

            // 3. Subir Favicon si es nuevo (ESTO FALTABA)
            let faviconRef = appearanceData.favicon;
            if (appearanceData.favicon instanceof File) {
                const formData = new FormData();
                formData.append('file', appearanceData.favicon);
                const result = await uploadSanityImage(formData);
                if (result.success && result.assetId) {
                    faviconRef = createImageReference(result.assetId)
                }
            }

            const appearancePayload = {
                _id: 'appearance-settings',
                _type: 'appearance',
                brandName: settings.siteName.trim(),
                primaryColor: appearanceData.primaryColor,
                accessibilityScale: clampAccessibilityScale(Number(appearanceData.accessibilityScale)),
                logoWidth: clampLogoMaxHeightPx(Number(appearanceData.logoWidth)),
                // Usamos las referencias procesadas
                logo: isSanityImageValue(logoRef) ? { _type: 'image', asset: logoRef.asset } : undefined,
                favicon: isSanityImageValue(faviconRef) ? { _type: 'image', asset: faviconRef.asset } : undefined,
                splitText: appearanceData.splitText,
                isJoined: appearanceData.isJoined,
                minDepositPercent: Number(appearanceData.minDepositPercent),
                minIncome: Number(appearanceData.minIncome),
                minWorkExperience: appearanceData.minWorkExperience,
                hero: {
                    title: appearanceData.heroTitle,
                    subtitle: appearanceData.heroSubtitle,
                    position: appearanceData.heroPosition,
                    image: isSanityImageValue(heroImageRef) ? { _type: 'image', asset: heroImageRef.asset } : undefined
                }
            };

            const response = await saveGlobalPreferences(settings, appearancePayload, contact);

            if (response.success) {
                alert('Ajustes guardados correctamente')
            } else {
                alert('Hubo un error al guardar')
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert('Error al guardar')
        } finally {
            setIsSubmitting(false)
        }
    }

    const RUTAS_NAV: RutaOption[] = [
        { title: 'Inicio', value: '/' },
        { title: 'Comprar un Auto', value: '/catalogo' },
        { title: 'Vende tu Auto', value: '/vender' },
        { title: 'Financiamiento', value: '/financiamiento' },
        { title: 'Preguntas Frecuentes', value: '/faq' },
        { title: 'Terminos y Condiciones', value: '/terminos' },
        { title: 'Contacto', value: '/contacto' }
    ]

    const RUTAS_FOOTER: RutaOption[] = [
        { title: 'Inicio', value: '/' },
        { title: 'Comprar un Auto', value: '/catalogo' },
        { title: 'Vende tu Auto', value: '/vender' },
        { title: 'Financiamiento', value: '/financiamiento' },
        { title: 'Preguntas Frecuentes', value: '/faq' },
        { title: 'Terminos y Condiciones', value: '/terminos' },
        { title: 'Contacto', value: '/contacto' }
    ]

    // FUNCIONES NAVEGACION
    const handleAddNavItem = (target: 'navMenu' | 'footerLinks') => {
        const newItem = { _key: Math.random().toString(36).substr(2, 9), title: 'Nuevo Enlace', path: '/' }
        setSettings(prev => ({ ...prev, [target]: [...prev[target], newItem] }))
    }

    const handleUpdateNavItem = (target: 'navMenu' | 'footerLinks', index: number, field: string, value: string) => {
        const updated = [...settings[target]]
        updated[index] = { ...updated[index], [field]: value }
        setSettings(prev => ({ ...prev, [target]: updated }))
    }

    const handleMoveNavItem = (target: 'navMenu' | 'footerLinks', index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= settings[target].length) return
        const updated = [...settings[target]]
        const [movedItem] = updated.splice(index, 1)
        updated.splice(newIndex, 0, movedItem)
        setSettings(prev => ({ ...prev, [target]: updated }))
    }

    // FUNCIONES FAQ
    const handleAddFaq = async () => {
        if (!newFaq.question || !newFaq.answer) return alert("Completa los campos")
        setIsSubmitting(true)
        try {
            const result = await createSanityDocument('faq', newFaq)
            if (result.success && result.data) {
                setFaqs(prev => [...prev, toFaqItem(result.data as unknown as SanityFaqDocument)])
                setNewFaq({ question: '', answer: '', order: faqs.length + 1 })
                alert("Pregunta agregada")
            } else {
                alert("Error al agregar la pregunta")
            }
        } finally { setIsSubmitting(false) }
    }

    const handleDeleteFaq = async (id: string) => {
        if (confirm("¿Eliminar esta pregunta?")) {
            const result = await deleteSanityDocument(id)
            if (result.success) {
                setFaqs(prev => prev.filter(f => f._id !== id))
            } else {
                alert("Error al eliminar la pregunta")
            }
        }
    }

    const handleUpdateFaq = async () => {
        if (!editingFaqId) return
        if (!editFaqForm.question || !editFaqForm.answer) return alert("Completa los campos")

        setIsSubmitting(true)
        try {
            const result = await updateSanityDocument(editingFaqId, editFaqForm)
            if (result.success) {
                setFaqs(prev =>
                    prev
                        .map(f => (f._id === editingFaqId ? { ...f, ...editFaqForm } : f))
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                )
                setEditingFaqId(null)
                alert("Pregunta actualizada")
            } else {
                alert("Error al actualizar la pregunta")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    // FUNCIONES RESEÑAS
    const handleAddReview = async () => {
        if (!newReview.name || !newReview.comment) return alert("Faltan datos")
        setIsSubmitting(true)
        try {
            const result = await createSanityDocument('review', newReview)
            if (result.success && result.data) {
                setAllReviews(prev => [toReviewItem(result.data as unknown as SanityReviewDocument), ...prev])
                setNewReview({ name: '', date: new Date().toISOString().split('T')[0], rating: 5, comment: '', badge: 'Comprador Satisfecho' })
                alert("Reseña publicada")
            } else {
                alert("Error al publicar la reseña")
            }
        } finally { setIsSubmitting(false) }
    }

    const handleDeleteReview = async (id: string) => {
        if (confirm("¿Eliminar reseña?")) {
            const result = await deleteSanityDocument(id)
            if (result.success) {
                setAllReviews(prev => prev.filter(r => r._id !== id))
            } else {
                alert("Error al eliminar la reseña")
            }
        }
    }

    const handleUpdateReview = async () => {
        if (!editingReviewId) return
        setIsSubmitting(true)
        try {
            const result = await updateSanityDocument(editingReviewId, editForm)
            if (result.success) {
                setAllReviews(prev => prev.map(r => r._id === editingReviewId ? { ...r, ...editForm } : r))
                setEditingReviewId(null)
                alert("Cambios guardados")
            } else {
                alert("Error al guardar cambios")
            }
        } finally { setIsSubmitting(false) }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40 text-left no-scrollbar">
            <style jsx global>{`
                ::-webkit-scrollbar { display: none !important; }
                body { overflow: hidden !important; scrollbar-width: none !important; -ms-overflow-style: none !important; }
                .main-scroll { height: 100vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
                .main-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="main-scroll no-scrollbar">
                <AdminNavigation />

                <main className="max-w-7xl mx-auto px-6 py-8 no-scrollbar">
                    <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-9 gap-4">
                        <div className="text-left flex-1">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 italic leading-none">Configuración</p>
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Preferencias</h1>
                        </div>
                        <button onClick={handleSaveGlobal} disabled={isSubmitting} className="w-full sm:w-auto bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-7 py-3.5 rounded-xl shadow-xl shadow-black/10 transition-all active:scale-95">
                            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </header>

                    <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase transition-all shrink-0 ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-zinc-400 border border-gray-100'}`}
                            >
                                {tab === 'general' ? 'General' : tab === 'personalizacion' ? 'Personalización' : tab === 'navegacion' ? 'Navegación' : tab === 'financiamiento' ? 'Financiamiento' : tab === 'contacto' ? 'Contacto' : tab === 'preguntas' ? 'Preguntas' : tab === 'seo' ? 'SEO' : tab === 'marcas' ? 'Marcas' : tab === 'legales' ? 'Legales' : 'Reseñas'}
                            </button>
                        ))}
                    </div>

                    <div className="no-scrollbar">
                        {/* PESTAÑA GENERAL */}
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-scrollbar">
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Identidad</h3>
                                    <PrefInput
                                        label="Nombre de la Empresa"
                                        placeholder="Nombre general del negocio"
                                        value={settings.siteName}
                                        onChange={handleSiteNameChange}
                                    />
                                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none -mt-4">
                                        Este nombre se usa en todo el sitio, el logo textual, el panel admin y las referencias generales.
                                    </p>

                                    {/* NUEVO: Campo para el Dominio dinámico */}
                                    <PrefInput
                                        label="URL del Sitio (Dominio)"
                                        placeholder="dominio.cl"
                                        value={settings.siteUrl}
                                        onChange={(v) => setSettings(prev => ({ ...prev, siteUrl: v }))}
                                    />
                                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none -mt-4">
                                        Escribe tu dominio sin &quot;https://&quot;. Ejemplo: miweb.cl
                                    </p>

                                    <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Descripción Footer</label>
                                        <textarea
                                            value={settings.footerDescription}
                                            onChange={(e) => setSettings(prev => ({ ...prev, footerDescription: e.target.value }))}
                                            placeholder="Breve descripción de la empresa para el pie de página..."
                                            className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-none shadow-none"
                                        />
                                    </div>

                                    <PrefInput
                                        label="Frase final Footer"
                                        placeholder="Tu socio de confianza"
                                        value={settings.footerTagline}
                                        onChange={(v) => setSettings(prev => ({ ...prev, footerTagline: v }))}
                                    />
                                </div>

                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none text-left">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5 transition-none">Sistema</h3>
                                    <div className="flex items-center justify-between bg-[#F7F8FA] p-5 rounded-2xl border border-gray-100 gap-4">
                                        <div className="leading-tight flex-1 transition-none">
                                            <p className="text-[10px] font-black uppercase leading-none">Modo Mantenimiento</p>
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1.5 leading-none">Oculta el sitio al público general</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                                            className={`w-12 h-6 rounded-full transition-none relative ${settings.maintenanceMode ? 'bg-black' : 'bg-zinc-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-none ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA PERSONALIZACIÓN */}
                        {activeTab === 'personalizacion' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-start no-scrollbar">

                                {/* Columna izquierda: identidad + favicon (evita hueco gigante si el logo es alto) */}
                                <div className="flex flex-col gap-7">
                                    {/* BLOQUE 1: IDENTIDAD VISUAL */}
                                    <div className="min-h-[420px] bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Identidad Visual</h3>
                                        <div className="space-y-6">
                                            {/* Color de Marca con Selector Visual */}
                                            <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Color de Marca</label>
                                                <div className="flex items-center gap-3">
                                                    {/* Cuadro de color visual */}
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                                                        <input
                                                            type="color"
                                                            value={appearanceData.primaryColor || '#000000'}
                                                            onChange={(e) => setAppearanceData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer border-none"
                                                        />
                                                    </div>
                                                    {/* Input de texto para el código Hex */}
                                                    <input
                                                        type="text"
                                                        value={appearanceData.primaryColor || '#000000'}
                                                        onChange={(e) => setAppearanceData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                        className="flex-1 h-[48px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none uppercase shadow-none transition-all focus:ring-1 focus:ring-black"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                                <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none">Presiona el cuadro para abrir la paleta de colores</p>
                                            </div>

                                            <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Nombre Actual</label>
                                                <div className="w-full rounded-xl bg-[#F7F8FA] px-5 py-4 text-[11px] font-bold text-black">
                                                    {settings.siteName || 'Sin nombre configurado'}
                                                </div>
                                                <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none">
                                                    El nombre se edita en la pestaña General.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Opciones de Estilo de Logo (Texto) */}
                                        <div className="bg-[#F7F8FA] rounded-2xl p-1 border border-gray-100/50">
                                            <div className="flex items-center justify-between p-4 px-4">
                                                <div className="leading-tight">
                                                    <p className="text-[9px] font-black uppercase text-zinc-800">Estilo Dividido</p>
                                                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">Resalta la primera palabra</p>
                                                </div>
                                                <button
                                                    onClick={() => setAppearanceData(prev => ({ ...prev, splitText: !prev.splitText }))}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${appearanceData.splitText ? 'bg-black' : 'bg-zinc-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${appearanceData.splitText ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                            <div className="h-[1px] bg-gray-200/50 mx-4"></div>
                                            <div className="flex items-center justify-between p-3 px-4">
                                                <div className="leading-tight">
                                                    <p className="text-[9px] font-black uppercase text-zinc-800">Eliminar Espacios</p>
                                                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">Muestra el nombre todo junto</p>
                                                </div>
                                                <button
                                                    onClick={() => setAppearanceData(prev => ({ ...prev, isJoined: !prev.isJoined }))}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${appearanceData.isJoined ? 'bg-black' : 'bg-zinc-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${appearanceData.isJoined ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BLOQUE 2: LOGO PRINCIPAL (debajo de identidad visual) */}
                                    <div className="min-h-[430px] bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Logo de Empresa</h3>
                                        <div className="space-y-4 px-1">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                    Altura máxima del logo:{' '}
                                                    <span className="text-black">
                                                        {clampLogoMaxHeightPx(appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx)} px
                                                    </span>
                                                </label>
                                                <p className="text-[8px] font-medium leading-relaxed text-zinc-500">
                                                    Altura máxima del logo en header y pie (entre {LOGO_MAX_HEIGHT_MIN_PX} y {LOGO_MAX_HEIGHT_MAX_PX}{' '}
                                                    px). El ancho se calcula solo para mantener la proporción; en móvil no desborda el contenedor.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {LOGO_SIZE_PRESETS.map((p) => (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setAppearanceData((prev) => ({ ...prev, logoWidth: p.value }))
                                                        }
                                                        className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-tight transition-colors ${clampLogoMaxHeightPx(appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx) === p.value
                                                            ? 'bg-black text-white'
                                                            : 'bg-[#F7F8FA] text-zinc-600 hover:bg-zinc-200'
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="range"
                                                min={LOGO_MAX_HEIGHT_MIN_PX}
                                                max={LOGO_MAX_HEIGHT_MAX_PX}
                                                step={LOGO_MAX_HEIGHT_STEP_PX}
                                                value={clampLogoMaxHeightPx(appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx)}
                                                onChange={(e) =>
                                                    setAppearanceData((prev) => ({
                                                        ...prev,
                                                        logoWidth: clampLogoMaxHeightPx(parseInt(e.target.value, 10)),
                                                    }))
                                                }
                                                className="w-full h-1.5 cursor-pointer rounded-lg bg-gray-100 accent-black appearance-none"
                                            />
                                            <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter text-zinc-400">
                                                <span>{LOGO_MAX_HEIGHT_MIN_PX} px</span>
                                                <span>{LOGO_MAX_HEIGHT_MAX_PX} px</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                            <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">
                                                Imagen del Logo (PNG con fondo transparente recomendado)
                                            </label>
                                            <div className="relative bg-[#F7F8FA] rounded-2xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4 min-h-[160px] overflow-hidden group">
                                                {appearanceData.logo ? (
                                                    <div className="flex flex-col items-center space-y-4 w-full">
                                                        <div
                                                            className="flex max-w-full items-center justify-center"
                                                            style={{
                                                                maxHeight: clampLogoMaxHeightPx(
                                                                    appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx
                                                                ),
                                                            }}
                                                        >
                                                            <img
                                                                src={isSanityImageValue(appearanceData.logo) ? urlFor(appearanceData.logo).url() : ""}
                                                                alt="Logo Preview"
                                                                style={{
                                                                    maxHeight: clampLogoMaxHeightPx(
                                                                        appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx
                                                                    ),
                                                                }}
                                                                className="h-auto w-auto max-w-full object-contain transition-all duration-300"
                                                            />
                                                        </div>
                                                        <p className="text-center text-[7px] font-bold uppercase tracking-tight text-zinc-400">
                                                            Misma altura máxima que en la web
                                                        </p>
                                                        <button
                                                            onClick={() => setAppearanceData(prev => ({ ...prev, logo: null }))}
                                                            className="text-[8px] font-black uppercase text-red-500 hover:underline transition-all"
                                                        >
                                                            Quitar logo
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase text-center">Seleccionar logo principal</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Accesibilidad Visual</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                    Escala general del sitio:{' '}
                                                    <span className="text-black">
                                                        {Math.round(clampAccessibilityScale(appearanceData.accessibilityScale) * 100)}%
                                                    </span>
                                                </label>
                                                <p className="text-[8px] font-medium leading-relaxed text-zinc-500">
                                                    Aumenta el tamaño base de textos y elementos tanto en las páginas públicas como en el panel administrativo.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {[1, 1.1, 1.2, 1.25].map((scale) => (
                                                    <button
                                                        key={scale}
                                                        type="button"
                                                        onClick={() => setAppearanceData((prev) => ({ ...prev, accessibilityScale: scale }))}
                                                        className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-tight transition-colors ${clampAccessibilityScale(appearanceData.accessibilityScale) === scale
                                                            ? 'bg-black text-white'
                                                            : 'bg-[#F7F8FA] text-zinc-600 hover:bg-zinc-200'
                                                            }`}
                                                    >
                                                        {Math.round(scale * 100)}%
                                                    </button>
                                                ))}
                                            </div>

                                            <input
                                                type="range"
                                                min={ACCESSIBILITY_SCALE_MIN}
                                                max={ACCESSIBILITY_SCALE_MAX}
                                                step={ACCESSIBILITY_SCALE_STEP}
                                                value={clampAccessibilityScale(appearanceData.accessibilityScale)}
                                                onChange={(e) =>
                                                    setAppearanceData((prev) => ({
                                                        ...prev,
                                                        accessibilityScale: clampAccessibilityScale(parseFloat(e.target.value)),
                                                    }))
                                                }
                                                className="w-full h-1.5 cursor-pointer rounded-lg bg-gray-100 accent-black appearance-none"
                                            />

                                            <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter text-zinc-400">
                                                <span>{Math.round(ACCESSIBILITY_SCALE_MIN * 100)}%</span>
                                                <span>{Math.round(ACCESSIBILITY_SCALE_MAX * 100)}%</span>
                                            </div>

                                            <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-4">
                                                <p
                                                    className="font-black uppercase text-black leading-none"
                                                    style={{ fontSize: `${clampAccessibilityScale(appearanceData.accessibilityScale)}rem` }}
                                                >
                                                    Vista previa
                                                </p>
                                                <p
                                                    className="mt-2 font-medium leading-relaxed text-zinc-600"
                                                    style={{ fontSize: `${0.8 * clampAccessibilityScale(appearanceData.accessibilityScale)}rem` }}
                                                >
                                                    Este ajuste mejora la lectura sin cambiar el diseño base del sitio.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="flex flex-col gap-7">
                                    <div className="min-h-[423px] bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Accesibilidad Visual</h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                    Escala general del sitio:{' '}
                                                    <span className="text-black">
                                                        {Math.round(clampAccessibilityScale(appearanceData.accessibilityScale) * 100)}%
                                                    </span>
                                                </label>
                                                <p className="text-[8px] font-medium leading-relaxed text-zinc-500">
                                                    Aumenta el tamaño base de textos y elementos tanto en las páginas públicas como en el panel administrativo.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {[1, 1.1, 1.2, 1.25].map((scale) => (
                                                    <button
                                                        key={scale}
                                                        type="button"
                                                        onClick={() => setAppearanceData((prev) => ({ ...prev, accessibilityScale: scale }))}
                                                        className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-tight transition-colors ${clampAccessibilityScale(appearanceData.accessibilityScale) === scale
                                                            ? 'bg-black text-white'
                                                            : 'bg-[#F7F8FA] text-zinc-600 hover:bg-zinc-200'
                                                            }`}
                                                    >
                                                        {Math.round(scale * 100)}%
                                                    </button>
                                                ))}
                                            </div>

                                            <input
                                                type="range"
                                                min={ACCESSIBILITY_SCALE_MIN}
                                                max={ACCESSIBILITY_SCALE_MAX}
                                                step={ACCESSIBILITY_SCALE_STEP}
                                                value={clampAccessibilityScale(appearanceData.accessibilityScale)}
                                                onChange={(e) =>
                                                    setAppearanceData((prev) => ({
                                                        ...prev,
                                                        accessibilityScale: clampAccessibilityScale(parseFloat(e.target.value)),
                                                    }))
                                                }
                                                className="w-full h-1.5 cursor-pointer rounded-lg bg-gray-100 accent-black appearance-none"
                                            />

                                            <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter text-zinc-400">
                                                <span>{Math.round(ACCESSIBILITY_SCALE_MIN * 100)}%</span>
                                                <span>{Math.round(ACCESSIBILITY_SCALE_MAX * 100)}%</span>
                                            </div>

                                            <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-3.5">
                                                <p
                                                    className="font-black uppercase text-black leading-none"
                                                    style={{ fontSize: `${clampAccessibilityScale(appearanceData.accessibilityScale)}rem` }}
                                                >
                                                    Vista previa
                                                </p>
                                                <p
                                                    className="mt-2 font-medium leading-relaxed text-zinc-600"
                                                    style={{ fontSize: `${0.8 * clampAccessibilityScale(appearanceData.accessibilityScale)}rem` }}
                                                >
                                                    Este ajuste mejora la lectura sin cambiar el diseño base del sitio.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-3.5">
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                                                        Ajuste actual
                                                    </p>
                                                    <p className="mt-2 text-[11px] font-black uppercase text-black leading-none">
                                                        {Math.round(clampAccessibilityScale(appearanceData.accessibilityScale) * 100)}%
                                                    </p>
                                                    <p className="mt-2 text-[8px] font-medium leading-relaxed text-zinc-500">
                                                        Se aplica en el sitio público y en el panel administrativo.
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-3.5">
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                                                        Recomendado
                                                    </p>
                                                    <p className="mt-2 text-[11px] font-black uppercase text-black leading-none">
                                                        110% o 120%
                                                    </p>
                                                    <p className="mt-2 text-[8px] font-medium leading-relaxed text-zinc-500">
                                                        Mejora la lectura sin modificar demasiado la composición general.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* BLOQUE 2: LOGO PRINCIPAL (columna derecha) */}
                                    <div className="hidden bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Logo de Empresa</h3>
                                        {/* Control de Tamaño del Logo (rango acotado; coincide con el sitio) */}
                                        <div className="space-y-4 px-1">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                    Altura máxima del logo:{' '}
                                                    <span className="text-black">
                                                        {clampLogoMaxHeightPx(appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx)} px
                                                    </span>
                                                </label>
                                                <p className="text-[8px] font-medium leading-relaxed text-zinc-500">
                                                    Altura máxima del logo en header y pie (entre {LOGO_MAX_HEIGHT_MIN_PX} y {LOGO_MAX_HEIGHT_MAX_PX}{' '}
                                                    px). El ancho se calcula solo para mantener la proporción; en móvil no desborda el contenedor.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {LOGO_SIZE_PRESETS.map((p) => (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setAppearanceData((prev) => ({ ...prev, logoWidth: p.value }))
                                                        }
                                                        className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-tight transition-colors ${clampLogoMaxHeightPx(appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx) === p.value
                                                            ? 'bg-black text-white'
                                                            : 'bg-[#F7F8FA] text-zinc-600 hover:bg-zinc-200'
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="range"
                                                min={LOGO_MAX_HEIGHT_MIN_PX}
                                                max={LOGO_MAX_HEIGHT_MAX_PX}
                                                step={LOGO_MAX_HEIGHT_STEP_PX}
                                                value={clampLogoMaxHeightPx(appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx)}
                                                onChange={(e) =>
                                                    setAppearanceData((prev) => ({
                                                        ...prev,
                                                        logoWidth: clampLogoMaxHeightPx(parseInt(e.target.value, 10)),
                                                    }))
                                                }
                                                className="w-full h-1.5 cursor-pointer rounded-lg bg-gray-100 accent-black appearance-none"
                                            />
                                            <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter text-zinc-400">
                                                <span>{LOGO_MAX_HEIGHT_MIN_PX} px</span>
                                                <span>{LOGO_MAX_HEIGHT_MAX_PX} px</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                            <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">
                                                Imagen del Logo (PNG con fondo transparente recomendado)
                                            </label>
                                            <div className="relative bg-[#F7F8FA] rounded-2xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4 min-h-[160px] overflow-hidden group">
                                                {appearanceData.logo ? (
                                                    <div className="flex flex-col items-center space-y-4 w-full">
                                                        <div
                                                            className="flex max-w-full items-center justify-center"
                                                            style={{
                                                                maxHeight: clampLogoMaxHeightPx(
                                                                    appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx
                                                                ),
                                                            }}
                                                        >
                                                            <img
                                                                src={isSanityImageValue(appearanceData.logo) ? urlFor(appearanceData.logo).url() : ""}
                                                                alt="Logo Preview"
                                                                style={{
                                                                    maxHeight: clampLogoMaxHeightPx(
                                                                        appearanceData.logoWidth ?? CONTENT_DEFAULTS.logoMaxHeightPx
                                                                    ),
                                                                }}
                                                                className="h-auto w-auto max-w-full object-contain transition-all duration-300"
                                                            />
                                                        </div>
                                                        <p className="text-center text-[7px] font-bold uppercase tracking-tight text-zinc-400">
                                                            Misma altura máxima que en la web
                                                        </p>
                                                        <button
                                                            onClick={() => setAppearanceData(prev => ({ ...prev, logo: null }))}
                                                            className="text-[8px] font-black uppercase text-red-500 hover:underline transition-all"
                                                        >
                                                            Quitar logo
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase text-center">Seleccionar logo principal</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* BLOQUE 3: FAVICON (debajo del logo de empresa) */}
                                    <div className="min-h-[443px] bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Icono de Navegador (Favicon)</h3>
                                        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                            <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Imagen del Icono (Cuadrada)</label>
                                            <div className="relative bg-[#F7F8FA] rounded-2xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4 min-h-[160px] overflow-hidden group">
                                                {appearanceData.favicon ? (
                                                    <div className="flex flex-col items-center space-y-3 w-full">
                                                        <img
                                                            src={isSanityImageValue(appearanceData.favicon) ? urlFor(appearanceData.favicon).width(64).url() : ""}
                                                            alt="Favicon Preview"
                                                            className="w-10 h-10 object-contain rounded shadow-sm"
                                                        />
                                                        <button
                                                            onClick={() => setAppearanceData(prev => ({ ...prev, favicon: null }))}
                                                            className="text-[8px] font-black uppercase text-red-500 hover:underline transition-all"
                                                        >
                                                            Quitar icono
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase text-center">Subir Favicon</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0]
                                                                if (!file) return
                                                                setIsSubmitting(true)
                                                                const formData = new FormData()
                                                                formData.append('file', file)
                                                                const result = await uploadSanityImage(formData)
                                                                if (result.success) {
                                                                    if (result.assetId) {
                                                                        setAppearanceData(prev => ({ ...prev, favicon: createImageReference(result.assetId) }))
                                                                    }
                                                                }
                                                                setIsSubmitting(false)
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-4">
                                            <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                                                Vista previa
                                            </p>
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                                                    {appearanceData.favicon && isSanityImageValue(appearanceData.favicon) ? (
                                                        <img
                                                            src={urlFor(appearanceData.favicon).width(48).height(48).url()}
                                                            alt="Vista previa del favicon"
                                                            className="h-8 w-8 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-[8px] font-black uppercase tracking-tight text-zinc-300">
                                                            Sin icono
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-[11px] font-black uppercase text-black leading-none">
                                                        {appearanceData.favicon ? 'Icono cargado' : 'Sin favicon'}
                                                    </p>
                                                    <p className="text-[8px] font-medium leading-relaxed text-zinc-500">
                                                        Recomendado en PNG cuadrado, simple y reconocible.
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-[8px] font-medium leading-relaxed text-zinc-400">
                                                Este icono se usa para identificar tu sitio en la pestaña del navegador.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* BLOQUE 4: BANNER PRINCIPAL (HERO) */}
                                <div className="lg:col-span-2 bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <div className="border-b border-gray-50 pb-5">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 leading-none">Banner Principal (Hero)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 text-left">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none block">Imagen del Banner</label>
                                            <div className="flex items-center gap-5">
                                                <div className="relative w-40 h-24 bg-[#F7F8FA] border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                                                    {appearanceData.heroImage ? (
                                                        <img
                                                            src={appearanceData.heroImage instanceof File
                                                                ? URL.createObjectURL(appearanceData.heroImage)
                                                                : urlFor(appearanceData.heroImage).url()}
                                                            className="w-full h-full object-cover"
                                                            alt="Hero preview"
                                                        />
                                                    ) : (
                                                        <span className="text-[8px] font-black text-zinc-300 uppercase">Sin imagen</span>
                                                    )}
                                                </div>
                                                <label className="cursor-pointer bg-black text-white text-[8px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl transition-all active:scale-95">
                                                    Cambiar Foto
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) setAppearanceData({ ...appearanceData, heroImage: file })
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-left">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none block">Alineación de Fotografía</label>
                                            <AdminSoftSelect
                                                value={appearanceData.heroPosition}
                                                onChange={(value) => setAppearanceData({ ...appearanceData, heroPosition: value })}
                                                options={[
                                                    { value: 'top', label: 'Superior (Enfocar arriba)' },
                                                    { value: 'center', label: 'Centro (Recomendado)' },
                                                    { value: 'bottom', label: 'Inferior (Enfocar abajo)' },
                                                ]}
                                            />
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none">Ajusta el enfoque si el auto queda cortado</p>
                                        </div>

                                        <div className="md:col-span-2 space-y-4">
                                            <PrefInput
                                                label="Título del Banner"
                                                placeholder="EJ: TRANSFORMA TU CAMINO"
                                                value={appearanceData.heroTitle}
                                                onChange={(v) => setAppearanceData(prev => ({ ...prev, heroTitle: v }))}
                                            />
                                            <PrefInput
                                                label="Subtítulo del Banner"
                                                placeholder="EJ: Comprar y vender un auto nunca fue tan simple."
                                                value={appearanceData.heroSubtitle}
                                                onChange={(v) => setAppearanceData(prev => ({ ...prev, heroSubtitle: v }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA NAVEGACIÓN */}
                        {activeTab === 'navegacion' && (
                            <div className="space-y-6">
                                {[
                                    { title: 'Navbar (Header)', target: 'navMenu', opts: RUTAS_NAV },
                                    { title: 'Enlaces Footer', target: 'footerLinks', opts: RUTAS_FOOTER }
                                ].map((menu) => (
                                    <div key={menu.target} className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-5">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 leading-none">{menu.title}</h3>
                                            <button onClick={() => handleAddNavItem(menu.target as 'navMenu' | 'footerLinks')} className="bg-black text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-none">añadir ruta</button>
                                        </div>
                                        <div className="space-y-5">
                                            {settings[menu.target as 'navMenu' | 'footerLinks'].map((item: NavItem, i: number) => (
                                                <div key={item._key} className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center bg-[#F7F8FA] p-4 rounded-2xl border border-gray-100 group">
                                                    <div className="flex flex-col gap-2 text-left leading-none">
                                                        <label className="text-[8px] font-black uppercase text-zinc-400">Título</label>
                                                        <input value={item.title} onChange={(e) => handleUpdateNavItem(menu.target as 'navMenu' | 'footerLinks', i, 'title', e.target.value)} className="bg-white rounded-xl h-9 px-4 text-[11px] font-bold outline-none border-none shadow-none" />
                                                    </div>
                                                    <div className="flex flex-col gap-2 text-left leading-none">
                                                        <label className="text-[8px] font-black uppercase text-zinc-400">Ruta</label>
                                                        <AdminSoftSelect
                                                            value={item.path}
                                                            onChange={(value) => handleUpdateNavItem(menu.target as 'navMenu' | 'footerLinks', i, 'path', value)}
                                                            options={menu.opts.map((r: RutaOption) => ({ value: r.value, label: r.title }))}
                                                            compact
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleMoveNavItem(menu.target as 'navMenu' | 'footerLinks', i, 'up')} className="p-2 text-zinc-400 hover:text-black transition-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 15l7-7 7 7" /></svg></button>
                                                        <button onClick={() => handleMoveNavItem(menu.target as 'navMenu' | 'footerLinks', i, 'down')} className="p-2 text-zinc-400 hover:text-black transition-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg></button>
                                                        <button onClick={() => setSettings(prev => ({ ...prev, [menu.target as 'navMenu' | 'footerLinks']: prev[menu.target as 'navMenu' | 'footerLinks'].filter((_, idx) => idx !== i) }))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PESTAÑA FINANCIAMIENTO */}
                        {activeTab === 'financiamiento' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-scrollbar">
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Configuración de Crédito</h3>
                                    <div className="w-full bg-[#F7F8FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div className="leading-tight text-left">
                                            <p className="text-[9px] font-black uppercase text-zinc-800">Pie Mínimo Automático</p>
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">Porcentaje base para calcular el pie de los autos</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={appearanceData.minDepositPercent}
                                                onChange={(e) => setAppearanceData(prev => ({ ...prev, minDepositPercent: parseInt(e.target.value) || 0 }))}
                                                className="w-16 h-10 bg-white border border-gray-200 rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-black"
                                            />
                                            <span className="text-[10px] font-black text-zinc-400">%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-[#F7F8FA] p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div className="leading-tight text-left">
                                            <p className="text-[9px] font-black uppercase text-zinc-800">Renta Mínima Requerida</p>
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">Sueldo mínimo para calificar al crédito</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-zinc-400">$</span>
                                            <input
                                                type="number"
                                                value={appearanceData.minIncome}
                                                onChange={(e) => setAppearanceData(prev => ({ ...prev, minIncome: parseInt(e.target.value) || 0 }))}
                                                className="w-28 h-10 bg-white border border-gray-200 rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-black"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full bg-[#F7F8FA] p-4 rounded-2xl border border-gray-100 space-y-3">
                                        <div className="leading-tight text-left">
                                            <p className="text-[9px] font-black uppercase text-zinc-800">Texto de Antigüedad</p>
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">Descripción de continuidad laboral requerida</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={appearanceData.minWorkExperience}
                                            onChange={(e) => setAppearanceData(prev => ({ ...prev, minWorkExperience: e.target.value }))}
                                            placeholder="Ej: Mínimo 1 año de continuidad"
                                            className="w-full h-10 bg-white border border-gray-200 rounded-xl px-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA CONTACTO */}
                        {activeTab === 'contacto' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-scrollbar">
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Redes y WhatsApp</h3>
                                    <PrefInput label="WhatsApp de Ventas" placeholder="56 9 3708 4907084907" value={contact.whatsapp} onChange={(v) => setContact(prev => ({ ...prev, whatsapp: v }))} />
                                </div>
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Información Corporativa</h3>
                                    <PrefInput label="Correo Electrónico" placeholder="ventas@tuautomotora.cl" value={contact.email} onChange={(v) => setContact(prev => ({ ...prev, email: v }))} />
                                    <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Dirección Física</label>
                                        <textarea value={contact.address} onChange={(e) => setContact(prev => ({ ...prev, address: e.target.value }))} placeholder="Ej: Av. Las Condes 123, Santiago" className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-none shadow-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA SEO (NUEVA) */}
                        {activeTab === 'seo' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-scrollbar">
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Páginas Principales (SEO)</h3>
                                    <div className="space-y-6">
                                        <SEOTextarea label="Inicio (Home)" value={settings.seoDescriptions.home} onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, home: v } })} />
                                        <SEOTextarea label="Catálogo General" value={settings.seoDescriptions.catalogo} onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, catalogo: v } })} />
                                        <SEOTextarea label="Vender mi Auto" value={settings.seoDescriptions.vender} onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, vender: v } })} />
                                        <SEOTextarea label="Financiamiento" value={settings.seoDescriptions.financiamiento} onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, financiamiento: v } })} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Páginas Secundarias (SEO)</h3>
                                    <div className="space-y-6">
                                        <SEOTextarea label="Preguntas Frecuentes" value={settings.seoDescriptions.faq} onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, faq: v } })} />
                                        <SEOTextarea label="Contacto" value={settings.seoDescriptions.contacto} onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, contacto: v } })} />
                                        <SEOTextarea
                                            label="Términos y Condiciones"
                                            value={settings.seoDescriptions.terminos}
                                            onChange={(v) => setSettings({ ...settings, seoDescriptions: { ...settings.seoDescriptions, terminos: v } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA PREGUNTAS */}
                        {activeTab === 'preguntas' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start no-scrollbar">
                                <div className="lg:col-span-1 bg-white rounded-[30px] border border-gray-100 p-6 space-y-5 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 leading-none">Nueva Pregunta</h3>
                                    <div className="flex flex-col space-y-4">
                                        <PrefInput label="Pregunta" value={newFaq.question} onChange={(v) => setNewFaq(prev => ({ ...prev, question: v }))} />
                                        <div className="flex flex-col space-y-2.5 leading-none">
                                            <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Respuesta</label>
                                            <textarea value={newFaq.answer} onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))} className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-bold outline-none min-h-[120px] resize-none" />
                                        </div>
                                        <PrefInput label="Orden" type="number" value={newFaq.order.toString()} onChange={(v) => setNewFaq(prev => ({ ...prev, order: parseInt(v) || 0 }))} />
                                        <button onClick={handleAddFaq} disabled={isSubmitting} className="w-full bg-black text-white text-[9px] font-black uppercase py-4 rounded-xl shadow-xl shadow-black/10 transition-none">{isSubmitting ? 'Guardando...' : 'Agregar Pregunta'}</button>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    {faqs.map(f => (
                                        <div key={f._id} className={`bg-white border border-gray-100 rounded-3xl shadow-none relative transition-none ${editingFaqId === f._id ? 'p-4' : 'p-6'}`}>
                                            <div className="absolute top-4 right-4 flex gap-1 items-center bg-white/80 p-1 rounded-full border border-gray-100 z-10">
                                                {editingFaqId === f._id ? (
                                                    <>
                                                        <button onClick={handleUpdateFaq} className="text-emerald-500 p-1.5 rounded-full hover:bg-emerald-50 transition-none">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                        <button onClick={() => setEditingFaqId(null)} className="text-zinc-500 p-1.5 rounded-full hover:bg-gray-100 transition-none">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingFaqId(f._id)
                                                                setEditFaqForm({
                                                                    question: f.question,
                                                                    answer: f.answer,
                                                                    order: f.order || 0,
                                                                })
                                                            }}
                                                            className="p-1 text-zinc-400 hover:text-black rounded-full transition-none hover:bg-gray-50"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDeleteFaq(f._id)} className="p-1 text-zinc-400 hover:text-red-500 rounded-full transition-none hover:bg-red-50">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {editingFaqId === f._id ? (
                                                <div className="space-y-3 pt-2">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <input
                                                            value={editFaqForm.question}
                                                            onChange={(e) => setEditFaqForm(prev => ({ ...prev, question: e.target.value }))}
                                                            className="w-full h-10 bg-gray-50 rounded-lg px-3 text-[10px] font-bold border-none"
                                                            placeholder="Pregunta"
                                                        />
                                                        <textarea
                                                            value={editFaqForm.answer}
                                                            onChange={(e) => setEditFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                                                            className="w-full bg-gray-50 rounded-xl p-3 text-[10.5px] font-medium min-h-[78px] resize-none border-none"
                                                            placeholder="Respuesta"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editFaqForm.order}
                                                            onChange={(e) => setEditFaqForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                                            className="w-full h-10 bg-gray-50 rounded-lg px-3 text-[10px] font-bold border-none"
                                                            placeholder="Orden"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-left pr-10">
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nivel {f.order || 0}</p>
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-black">{f.question}</h4>
                                                    <p className="text-[10px] text-zinc-500 font-medium mt-1 line-clamp-2 italic leading-relaxed">&quot;{f.answer}&quot;</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA RESEÑAS */}
                        {activeTab === 'resenas' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left no-scrollbar">
                                <div className="lg:col-span-1 bg-white rounded-[30px] border border-gray-100 p-6 space-y-5 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 leading-none">Nueva Reseña</h3>
                                    <PrefInput label="Nombre" value={newReview.name} onChange={(v) => setNewReview(prev => ({ ...prev, name: v }))} />
                                    <PrefInput label="Fecha" type="date" value={newReview.date} onChange={(v) => setNewReview(prev => ({ ...prev, date: v }))} />
                                    <div className="flex flex-col space-y-2 leading-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Etiqueta</label>
                                        <AdminSoftSelect
                                            value={newReview.badge}
                                            onChange={(value) => setNewReview(prev => ({ ...prev, badge: value }))}
                                            options={[
                                                { value: 'Comprador Satisfecho', label: 'Comprador Satisfecho' },
                                                { value: 'Vendedor Satisfecho', label: 'Vendedor Satisfecho' },
                                                { value: 'Cliente Verificado', label: 'Cliente Verificado' },
                                                { value: 'Opini\u00F3n Real de Cliente', label: 'Opini\u00F3n Real de Cliente' },
                                            ]}
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2 leading-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Estrellas (1-5)</label>
                                        <input type="number" min="1" max="5" value={newReview.rating} onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))} className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none" />
                                    </div>
                                    <div className="flex flex-col space-y-2 leading-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Comentario</label>
                                        <textarea value={newReview.comment} onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))} className="w-full bg-[#F7F8FA] rounded-xl p-5 text-[11px] font-bold outline-none min-h-[100px] resize-none" />
                                    </div>
                                    <button onClick={handleAddReview} disabled={isSubmitting} className="w-full bg-black text-white text-[9px] font-black uppercase py-4 rounded-xl shadow-xl shadow-black/10 transition-none">{isSubmitting ? 'Publicando...' : 'Publicar Reseña'}</button>
                                </div>
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 no-scrollbar">
                                    {allReviews.map(rev => (
                                        <div key={rev._id} className={`bg-white border border-gray-200 rounded-3xl text-left h-full relative transition-none shadow-none ${editingReviewId === rev._id ? 'p-4' : 'p-6'}`}>
                                            <div className="absolute top-4 right-4 flex gap-1 items-center bg-white/80 p-1 rounded-full border border-gray-100 z-10">
                                                {editingReviewId === rev._id ? (
                                                    <>
                                                        <button onClick={handleUpdateReview} className="text-emerald-500 p-1.5 rounded-full hover:bg-emerald-50 transition-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg></button>
                                                        <button onClick={() => setEditingReviewId(null)} className="text-zinc-500 p-1.5 rounded-full hover:bg-gray-100 transition-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => { setEditingReviewId(rev._id); setEditForm({ ...rev }) }} className="p-1 text-zinc-400 hover:text-black rounded-full transition-none hover:bg-gray-50"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                                        <button onClick={() => handleDeleteReview(rev._id)} className="p-1 text-zinc-400 hover:text-red-500 rounded-full transition-none hover:bg-red-50"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                    </>
                                                )}
                                            </div>
                                            {editingReviewId === rev._id ? (
                                                <div className="space-y-3 pt-2">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full h-8 bg-gray-50 rounded-lg px-2 text-[10px] font-bold border-none" placeholder="Nombre" />
                                                            <SoftDateInput
                                                                value={editForm.date}
                                                                onChange={(value) => setEditForm(prev => ({ ...prev, date: value }))}
                                                                placeholder="Seleccionar fecha"
                                                                variant="adminCompact"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <AdminSoftSelect
                                                                value={editForm.badge}
                                                                onChange={(value) => setEditForm(prev => ({ ...prev, badge: value }))}
                                                                options={[
                                                                    { value: 'Comprador Satisfecho', label: 'Comprador Satisfecho' },
                                                                    { value: 'Vendedor Satisfecho', label: 'Vendedor Satisfecho' },
                                                                    { value: 'Cliente Verificado', label: 'Cliente Verificado' },
                                                                    { value: 'Opini\u00F3n Real de Cliente', label: 'Opini\u00F3n Real de Cliente' },
                                                                ]}
                                                                compact
                                                            />
                                                            <input type="number" min="1" max="5" value={editForm.rating} onChange={(e) => setEditForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))} className="w-full h-8 bg-gray-50 rounded-lg px-2 text-[10px] font-bold border-none" />
                                                        </div>
                                                    </div>
                                                    <textarea value={editForm.comment} onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))} className="w-full bg-gray-50 rounded-xl p-2 text-[10.5px] font-medium min-h-[60px] resize-none border-none" placeholder="Comentario" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4 transition-none">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center font-bold text-white uppercase shrink-0 text-base leading-none">{rev.name?.charAt(0)}</div>
                                                        <div className="flex flex-col gap-0.5 leading-none">
                                                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 leading-none">{rev.badge || 'Comprador'}</span>
                                                            <div className="flex items-center gap-1.5 transition-none">
                                                                <h4 className="font-extrabold text-black uppercase text-sm tracking-tighter leading-none">{rev.name}</h4>
                                                                <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full flex items-center justify-center shrink-0 transition-none"><svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17L4 12" fill="none" /></svg></div>
                                                            </div>
                                                            <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 leading-none">{rev.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5 transition-none">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-zinc-800' : 'text-zinc-200'} fill-current transition-none`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        ))}
                                                    </div>
                                                    <p className="text-[12px] text-zinc-700 leading-relaxed font-medium italic transition-none">&quot;{rev.comment}&quot;</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'marcas' && (
                            <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5 shadow-none">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-5 leading-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Marcas y Modelos</h3>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                                        Corrige errores escritos
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {brands.length === 0 ? (
                                        <p className="text-[9px] font-bold uppercase tracking-tighter text-zinc-400">
                                            Aún no hay marcas registradas.
                                        </p>
                                    ) : (
                                        brands.map((brand) => (
                                            <div key={brand._id} className="rounded-[20px] border border-gray-100 bg-[#F7F8FA] p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black uppercase text-black leading-none">
                                                            {brand.name}
                                                        </p>
                                                        <p className="mt-1 text-[8px] font-bold uppercase tracking-tighter text-zinc-400">
                                                            {brand.models?.length || 0} modelos
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleDeleteBrand(brand)}
                                                        disabled={isSubmitting}
                                                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                        title="Eliminar marca"
                                                        aria-label="Eliminar marca"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {(brand.models?.length || 0) > 0 && (
                                                    <div className="space-y-2">
                                                        {brand.models?.map((model) => (
                                                            <div key={model._key} className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-gray-100">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[8px] font-black uppercase text-zinc-700 leading-none">
                                                                        {model.modelName}
                                                                    </p>
                                                                    <p className="mt-1 text-[7px] font-bold uppercase tracking-tighter text-zinc-400">
                                                                        {(model.versions?.length || 0)} versiones
                                                                    </p>
                                                                    {(model.versions?.length || 0) > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {model.versions?.map((version) => (
                                                                                <span
                                                                                    key={`${model._key}-${version}`}
                                                                                    className="rounded-full border border-gray-200 bg-[#F7F8FA] px-2.5 py-1 text-[7px] font-bold uppercase tracking-tight text-zinc-500"
                                                                                >
                                                                                    {version}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void handleDeleteModel(brand.name, model.modelName)}
                                                                    disabled={isSubmitting}
                                                                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                                    title="Eliminar modelo"
                                                                    aria-label="Eliminar modelo"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA LEGALES */}
                        {activeTab === 'legales' && (
                            <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5 shadow-none">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 mb-5">Contenido Legal</h3>
                                <PrefInput
                                    label="Fecha de Actualización"
                                    type="date"
                                    value={settings.lastLegalUpdate}
                                    onChange={(v) => setSettings(prev => ({ ...prev, lastLegalUpdate: v }))}
                                />
                                <div className="flex flex-col space-y-2.5 text-left">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">
                                        Terminos y Condiciones
                                    </label>
                                    <textarea
                                        value={settings.termsAndConditions}
                                        onChange={(e) => setSettings(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                                        className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-medium outline-none min-h-[400px] resize-y"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

function PrefInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
    if (type === 'date') {
        return (
            <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
                <SoftDateInput
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder || 'Seleccionar fecha'}
                    variant="admin"
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-none shadow-none placeholder:text-zinc-300 placeholder:font-normal" />
        </div>
    )
}

// Componente auxiliar para las cajas de texto SEO
function SEOTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Escribe la descripción para Google aquí..."
                className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black min-h-[80px] resize-none shadow-none transition-all placeholder:text-zinc-300"
            />
            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none">Recomendado: Máximo 160 caracteres.</p>
        </div>
    )
}





