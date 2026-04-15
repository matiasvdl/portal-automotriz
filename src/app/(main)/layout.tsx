import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';
import { Metadata } from 'next';

// --- PASO B: CONFIGURACIÓN SEO GLOBAL Y TEMPLATE ---
export async function generateMetadata(): Promise<Metadata> {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`, {}, { next: { revalidate: 0 } });

    const name = config?.siteName || 'Portal Automotriz';
    const description = config?.seoDescriptions?.home || 'Compra y venta de vehículos seleccionados con la mejor gestión del mercado.';

    return {
        title: {
            default: name,
            template: `%s | ${name}`, // Esto hace que en Contacto se vea: "Contacto | VDL Motors"
        },
        description: description,
        icons: {
            icon: '/favicon.ico', // Asegúrate de tener un favicon en public
        }
    };
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // 1. Ahora pedimos tres cosas: Configuración, Apariencia y Contacto
    // Añadimos 'primaryColor' a la consulta de appearance para el Paso A
    const [config, appearance, contact] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { next: { revalidate: 0 } }),
        client.fetch(`*[_type == "appearance"][0]{
            brandName, 
            logo, 
            splitText, 
            isJoined,
            primaryColor,
            minDepositPercent, 
            minIncome, 
            minWorkExperience  
        }`, {}, { next: { revalidate: 0 } }),
        client.fetch(`*[_type == "contactSettings"][0]`, {}, { next: { revalidate: 0 } })
    ]);

    if (config?.maintenanceMode === true) {
        redirect('/mantenimiento');
    }

    // 2. Unimos la configuración general con los datos de contacto
    const configCompleta = { ...config, ...contact };

    return (
        <SettingsProvider config={configCompleta} appearance={appearance}>
            <div className="flex flex-col min-h-screen">
                <Navigation config={configCompleta} />

                {/* Agregamos flex-grow para que el contenido empuje al footer 
                    hacia abajo en páginas con poco texto (como Términos o FAQ)
                */}
                <main className="flex-grow">
                    {children}
                </main>

                <Footer config={configCompleta} />
            </div>
        </SettingsProvider>
    );
}