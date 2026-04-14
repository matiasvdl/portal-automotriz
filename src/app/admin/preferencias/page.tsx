'use client'

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import AdminNavigation from '@/components/AdminNavigation'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import {
    uploadSanityImage,
    saveGlobalPreferences,
    createSanityDocument,
    deleteSanityDocument,
    updateSanityDocument
} from '@/app/actions/preferencesActions'

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

type TabType = 'general' | 'personalizacion' | 'navegacion' | 'financiamiento' | 'resenas' | 'contacto' | 'preguntas';

export default function PreferenciasPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('general')

    const [settings, setSettings] = useState({
        _id: '',
        siteName: 'VDL MOTORS',
        footerDescription: '',
        footerTagline: '',
        navMenu: [] as NavItem[],
        footerLinks: [] as NavItem[],
        maintenanceMode: false
    })

    const [appearanceData, setAppearanceData] = useState({
        _id: 'appearance-settings',
        brandName: 'VDL GROUP',
        logo: null as any,
        splitText: true,
        isJoined: false,
        minDepositPercent: 30,
        minIncome: 500000,
        minWorkExperience: '',
        heroTitle: 'TRANSFORMA TU CAMINO',
        heroPosition: 'center',
        heroImage: null as any // CAMPO AGREGADO
    })

    const [contact, setContact] = useState({
        _id: 'global-contact',
        whatsapp: '',
        email: '',
        address: ''
    })

    const [allReviews, setAllReviews] = useState<any[]>([])
    const [faqs, setFaqs] = useState<any[]>([])
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 0 })

    const [newReview, setNewReview] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        rating: 5,
        comment: '',
        badge: 'Comprador Satisfecho'
    })

    const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', date: '', rating: 5, comment: '', badge: '' })

    // --- EFECTO DE SEGURIDAD: Bloqueo de acceso por Rol ---
    useEffect(() => {
        if (status === 'authenticated') {
            const userRole = (session?.user as any)?.role
            // Si NO es Admin Principal Y NO es Administrador, lo expulsamos
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
                    client.fetch(`*[_type == "contactSettings"][0]`, {}, { cache: 'no-store' }),
                    client.fetch(`*[_type == "faq"] | order(order asc)`, {}, { cache: 'no-store' }),
                    client.fetch(`*[_id == "appearance-settings"][0]`, {}, { cache: 'no-store' })
                ]);

                if (config) {
                    setSettings({
                        _id: config._id,
                        siteName: config.siteName || '',
                        footerDescription: config.footerDescription || '',
                        footerTagline: config.footerTagline || '',
                        navMenu: config.navMenu || [],
                        footerLinks: config.footerLinks || [],
                        maintenanceMode: config.maintenanceMode || false
                    })
                }

                if (appearance) {
                    setAppearanceData({
                        _id: appearance._id || 'appearance-settings',
                        brandName: appearance.brandName || '',
                        logo: appearance.logo || null,
                        splitText: appearance.splitText !== undefined ? appearance.splitText : true,
                        isJoined: appearance.isJoined || false,
                        minDepositPercent: appearance.minDepositPercent || 30,
                        minIncome: appearance.minIncome || 500000,
                        minWorkExperience: appearance.minWorkExperience || '',
                        heroTitle: appearance.heroTitle || 'TRANSFORMA TU CAMINO',
                        heroPosition: appearance.heroPosition || 'center',
                        heroImage: appearance.heroImage || null // CARGA DE IMAGEN AGREGADA
                    })
                }

                if (reviews) setAllReviews(reviews)
                if (faqData) setFaqs(faqData)
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
            let heroImageRef = appearanceData.heroImage;

            // Subir imagen de forma segura a través del servidor
            if (appearanceData.heroImage instanceof File) {
                const formData = new FormData();
                formData.append('file', appearanceData.heroImage);
                const result = await uploadSanityImage(formData);
                if (result.success && result.assetId) {
                    heroImageRef = { _type: 'image', asset: { _type: "reference", _ref: result.assetId } }
                }
            }

            // Preparar paquete de datos
            const appearancePayload = {
                _id: 'appearance-settings',
                brandName: appearanceData.brandName,
                logo: appearanceData.logo?.asset?._ref ? appearanceData.logo : undefined,
                splitText: appearanceData.splitText,
                isJoined: appearanceData.isJoined,
                minDepositPercent: Number(appearanceData.minDepositPercent),
                minIncome: Number(appearanceData.minIncome),
                minWorkExperience: appearanceData.minWorkExperience,
                heroTitle: appearanceData.heroTitle,
                heroPosition: appearanceData.heroPosition,
                heroImage: heroImageRef
            };

            // Llamar a la acción del servidor
            const response = await saveGlobalPreferences(settings, appearancePayload, contact);

            if (response.success) {
                alert('Ajustes guardados correctamente')
            } else {
                alert('Hubo un error al guardar')
            }
        } catch (error) {
            console.error(error); alert('Error al guardar')
        } finally { setIsSubmitting(false) }
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
                setFaqs(prev => [...prev, result.data])
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

    // FUNCIONES RESEÑAS
    const handleAddReview = async () => {
        if (!newReview.name || !newReview.comment) return alert("Faltan datos")
        setIsSubmitting(true)
        try {
            const result = await createSanityDocument('review', newReview)
            if (result.success && result.data) {
                setAllReviews(prev => [result.data, ...allReviews])
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
                    <header className="flex justify-between items-end mb-9">
                        <div className="text-left flex-1">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 italic leading-none">Configuración</p>
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Preferencias</h1>
                        </div>
                        <button onClick={handleSaveGlobal} disabled={isSubmitting} className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-7 py-3 rounded-xl shadow-xl shadow-black/10 transition-all active:scale-95">
                            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </header>

                    <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
                        {['general', 'personalizacion', 'navegacion', 'financiamiento', 'contacto', 'preguntas', 'resenas'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all shrink-0 ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-zinc-400 border border-gray-100'}`}
                            >
                                {tab === 'general' ? 'General' : tab === 'personalizacion' ? 'Personalización' : tab === 'navegacion' ? 'Navegación' : tab === 'financiamiento' ? 'Financiamiento' : tab === 'contacto' ? 'Contacto' : tab === 'preguntas' ? 'Preguntas' : 'Reseñas'}                            </button>
                        ))}
                    </div>

                    <div className="no-scrollbar">
                        {/* PESTAÑA GENERAL */}
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-scrollbar">
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Identidad</h3>
                                    <PrefInput label="Nombre del Sitio (SEO)" value={settings.siteName} onChange={(v) => setSettings(prev => ({ ...prev, siteName: v }))} />
                                    <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Descripción Footer</label>
                                        <textarea value={settings.footerDescription} onChange={(e) => setSettings(prev => ({ ...prev, footerDescription: e.target.value }))} className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-none shadow-none" />
                                    </div>
                                    <PrefInput label="Frase final Footer" value={settings.footerTagline} onChange={(v) => setSettings(prev => ({ ...prev, footerTagline: v }))} />
                                </div>
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none text-left">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5 transition-none">Sistema</h3>
                                    <div className="flex items-center justify-between bg-[#F7F8FA] p-5 rounded-2xl border border-gray-100 gap-4">
                                        <div className="leading-tight flex-1 transition-none"><p className="text-[10px] font-black uppercase leading-none">Modo Mantenimiento</p><p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1.5 leading-none">Oculta el sitio al público general</p></div>
                                        <button onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} className={`w-12 h-6 rounded-full transition-none relative ${settings.maintenanceMode ? 'bg-black' : 'bg-zinc-200'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-none ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PESTAÑA PERSONALIZACIÓN */}
                        {activeTab === 'personalizacion' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-scrollbar">

                                {/* BLOQUE 1: IDENTIDAD DE TEXTO */}
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Configuración de Texto</h3>

                                        <PrefInput
                                            label="Nombre de la Marca"
                                            placeholder="Ej: VDL GROUP"
                                            value={appearanceData.brandName}
                                            onChange={(v) => setAppearanceData(prev => ({ ...prev, brandName: v }))}
                                        />
                                    </div>

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

                                {/* BLOQUE 2: LOGO DE IMAGEN */}
                                <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none mb-5">Logo de Empresa</h3>

                                    <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Imagen del Logo</label>
                                        <div className="relative bg-[#F7F8FA] rounded-2xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4 min-h-[160px] overflow-hidden group">
                                            {appearanceData.logo ? (
                                                <div className="flex flex-col items-center space-y-4 w-full">
                                                    <img
                                                        src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${appearanceData.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}`}
                                                        alt="Logo Preview"
                                                        className="h-16 w-auto object-contain"
                                                    />
                                                    <button
                                                        onClick={() => setAppearanceData(prev => ({ ...prev, logo: null }))}
                                                        className="text-[8px] font-black uppercase text-red-500 hover:underline transition-all"
                                                    >
                                                        Quitar logo
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase text-center">Haz clic o arrastra para seleccionar logo</p>
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

                                {/* BLOQUE 3: BANNER PRINCIPAL (NUEVA SECCION INTEGRADA) */}
                                <div className="lg:col-span-2 bg-white rounded-[30px] border border-gray-100 p-6 space-y-6 shadow-none">
                                    <div className="border-b border-gray-50 pb-5">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 leading-none">Banner Principal</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Subida de Imagen Banner */}
                                        <div className="space-y-3 text-left">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none block">Imagen del Banner</label>
                                            <div className="flex items-center gap-5">
                                                <div className="relative w-40 h-24 bg-[#F7F8FA] border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                                                    {appearanceData.heroImage ? (
                                                        <img
                                                            src={appearanceData.heroImage instanceof File
                                                                ? URL.createObjectURL(appearanceData.heroImage)
                                                                : `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${appearanceData.heroImage.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}`}
                                                            className="w-full h-full object-cover"
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

                                        {/* Selector de Posicion */}
                                        <div className="space-y-3 text-left">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none block">Alineación de Fotografía</label>
                                            <select
                                                value={appearanceData.heroPosition}
                                                onChange={(e) => setAppearanceData({ ...appearanceData, heroPosition: e.target.value })}
                                                className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none"
                                            >
                                                <option value="top">Superior (Enfocar arriba)</option>
                                                <option value="center">Centro (Recomendado)</option>
                                                <option value="bottom">Inferior (Enfocar abajo)</option>
                                            </select>
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-tight ml-1 italic leading-none">Úsalo si el auto queda cortado en la pantalla</p>
                                        </div>

                                        {/* Input Titulo Banner */}
                                        <div className="md:col-span-2">
                                            <PrefInput
                                                label="Título del Banner"
                                                placeholder="EJ: TRANSFORMA TU CAMINO"
                                                value={appearanceData.heroTitle}
                                                onChange={(v) => setAppearanceData(prev => ({ ...prev, heroTitle: v }))}
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
                                            <button onClick={() => handleAddNavItem(menu.target as any)} className="bg-black text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-none">añadir ruta</button>
                                        </div>
                                        <div className="space-y-5">
                                            {settings[menu.target as 'navMenu' | 'footerLinks'].map((item: NavItem, i: number) => (
                                                <div key={item._key} className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center bg-[#F7F8FA] p-4 rounded-2xl border border-gray-100 group">
                                                    <div className="flex flex-col gap-2 text-left leading-none">
                                                        <label className="text-[8px] font-black uppercase text-zinc-400">Título</label>
                                                        <input value={item.title} onChange={(e) => handleUpdateNavItem(menu.target as any, i, 'title', e.target.value)} className="bg-white rounded-xl h-9 px-4 text-[11px] font-bold outline-none border-none shadow-none" />
                                                    </div>
                                                    <div className="flex flex-col gap-2 text-left leading-none">
                                                        <label className="text-[8px] font-black uppercase text-zinc-400">Ruta</label>
                                                        <select value={item.path} onChange={(e) => handleUpdateNavItem(menu.target as any, i, 'path', e.target.value)} className="bg-white rounded-xl h-9 px-4 text-[10px] font-black uppercase outline-none border-none cursor-pointer appearance-none">
                                                            {menu.opts.map((r: RutaOption) => <option key={r.value} value={r.value}>{r.title}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleMoveNavItem(menu.target as any, i, 'up')} className="p-2 text-zinc-400 hover:text-black transition-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 15l7-7 7 7" /></svg></button>
                                                        <button onClick={() => handleMoveNavItem(menu.target as any, i, 'down')} className="p-2 text-zinc-400 hover:text-black transition-none"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M19 9l-7 7-7-7" /></svg></button>
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
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">Descripción de continuity laboral requerida</p>
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
                                    <PrefInput label="Correo Electrónico" placeholder="ventas@vdlmotors.cl" value={contact.email} onChange={(v) => setContact(prev => ({ ...prev, email: v }))} />
                                    <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Dirección Física</label>
                                        <textarea value={contact.address} onChange={(e) => setContact(prev => ({ ...prev, address: e.target.value }))} placeholder="Ej: Av. Las Condes 123, Santiago" className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-none shadow-none" />
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
                                        <div key={f._id} className="bg-white border border-gray-100 rounded-3xl p-6 flex justify-between items-center group shadow-none">
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nivel {f.order || 0}</p>
                                                <h4 className="text-[11px] font-black uppercase tracking-tight text-black">{f.question}</h4>
                                                <p className="text-[10px] text-zinc-500 font-medium mt-1 line-clamp-2 italic leading-relaxed">"{f.answer}"</p>
                                            </div>
                                            <button onClick={() => handleDeleteFaq(f._id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
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
                                    <div className="flex flex-col space-y- leading-none">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 leading-none">Etiqueta</label>
                                        <select value={newReview.badge} onChange={(e) => setNewReview(prev => ({ ...prev, badge: e.target.value }))} className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none cursor-pointer appearance-none">
                                            <option value="Comprador Satisfecho">Comprador Satisfecho</option>
                                            <option value="Vendedor Satisfecho">Vendedor Satisfecho</option>
                                            <option value="Cliente Verificado">Cliente Verificado</option>
                                            <option value="Opinión Real de Cliente">Opinión Real de Cliente</option>
                                        </select>
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
                                                            <input type="date" value={editForm.date} onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))} className="w-full h-8 bg-gray-50 rounded-lg px-2 text-[10px] font-bold border-none" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <select value={editForm.badge} onChange={(e) => setEditForm(prev => ({ ...prev, badge: e.target.value }))} className="w-full h-8 bg-gray-50 rounded-lg px-2 text-[9px] font-black uppercase border-none appearance-none">
                                                                <option value="Comprador Satisfecho">Comprador Satisfecho</option>
                                                                <option value="Vendedor Satisfecho">Vendedor Satisfecho</option>
                                                                <option value="Cliente Verificado">Cliente Verificado</option>
                                                                <option value="Opinión Real de Cliente">Opinión Real de Cliente</option>
                                                            </select>
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
                                                    <p className="text-[12px] text-zinc-700 leading-relaxed font-medium italic transition-none">"{rev.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-none shadow-none placeholder:text-zinc-300 placeholder:font-normal" />
        </div>
    )
}