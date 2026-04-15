import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';
import { Metadata } from 'next';
import { urlFor } from '@/sanity/lib/image';

// --- PASO B y C: SEO, FAVICON Y OPENGRAPH DINÁMICO ---
export async function generateMetadata(): Promise<Metadata> {
    // 1. Pedimos siteUrl, siteName, descripciones y los dos posibles iconos
    const data = await client.fetch(`*[_type == "siteConfig"][0]{ 
        siteName, 
        siteUrl,
        seoDescriptions,
        "appearance": *[_type == "appearance"][0]{ logo, favicon } 
    }`, {}, { next: { revalidate: 0 } });

    const name = data?.siteName || 'Portal Automotriz';
    const description = data?.seoDescriptions?.home || 'Compra y venta de vehículos seleccionados.';

    // 2. Lógica de URL dinámica para metadataBase
    const rawUrl = data?.siteUrl || 'localhost:3000';
    const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

    // 3. Lógica de Icono: Favicon > Logo > Fallback
    let iconUrl = '/favicon.ico';
    if (data?.appearance?.favicon) {
        iconUrl = urlFor(data.appearance.favicon).width(32).height(32).url();
    } else if (data?.appearance?.logo) {
        iconUrl = urlFor(data.appearance.logo).width(32).height(32).url();
    }

    // Imagen para redes sociales (OpenGraph)
    const ogImageUrl = data?.appearance?.logo
        ? urlFor(data.appearance.logo).width(1200).height(630).url()
        : '';

    return {
        metadataBase: new URL(baseUrl),
        title: {
            default: name,
            template: `%s | ${name}`,
        },
        description: description,
        icons: {
            icon: iconUrl,
            apple: iconUrl,
        },
        openGraph: {
            title: name,
            description: description,
            siteName: name,
            images: ogImageUrl ? [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `Logo de ${name}`,
                },
            ] : [],
            locale: 'es_CL',
            type: 'website',
        },
    };
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // Añadimos 'favicon' a la consulta de apariencia para que esté disponible en el Context
    const [config, appearance, contact] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { next: { revalidate: 0 } }),
        client.fetch(`*[_type == "appearance"][0]{
            brandName, 
            logo, 
            favicon,
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

    const configCompleta = { ...config, ...contact };

    return (
        <SettingsProvider config={configCompleta} appearance={appearance}>
            <div className="flex flex-col min-h-screen">
                <Navigation config={configCompleta} />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer config={configCompleta} />
            </div>
        </SettingsProvider>
    );
}