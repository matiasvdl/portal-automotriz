import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';
import { Metadata } from 'next';
import { urlFor, getContrastColor } from '@/sanity/lib/image';
import { CONTENT_DEFAULTS, resolvePrimaryColor } from '@/lib/content-defaults';

// --- PASO B y C: SEO, FAVICON Y OPENGRAPH DINÁMICO ---
export async function generateMetadata(): Promise<Metadata> {
    // CORRECCIÓN: Aseguramos que la metadata también busque por el ID estricto
    const data = await client.fetch(`*[_type == "siteConfig"][0]{ 
        siteName, 
        siteUrl,
        seoDescriptions,
        "appearance": *[_id == "appearance-settings"][0]{ logo, favicon } 
    }`, {}, { next: { revalidate: 0 } });

    const name = data?.siteName?.trim() || CONTENT_DEFAULTS.siteDisplayName;
    const description = data?.seoDescriptions?.home || 'Compra y venta de vehículos seleccionados.';

    const rawUrl = data?.siteUrl || 'localhost:3000';
    const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

    let iconUrl = '/favicon.ico';
    if (data?.appearance?.favicon) {
        iconUrl = urlFor(data.appearance.favicon).width(32).height(32).url();
    } else if (data?.appearance?.logo) {
        iconUrl = urlFor(data.appearance.logo).width(32).height(32).url();
    }

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
    // 1. Fetch unificado, usando el ID estricto para evitar documentos duplicados/borradores
    const [config, appearance, contact] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { cache: 'no-store' }),
        client.fetch(`*[_id == "appearance-settings"][0]{
            brandName, 
            logo, 
            favicon,
            logoWidth,
            splitText, 
            isJoined, 
            accessibilityScale,
            primaryColor,
            minDepositPercent, 
            minIncome, 
            minWorkExperience,
            hero {
                title,
                subtitle,
                image,
                position
            }
        }`, {}, { cache: 'no-store' }),
        client.fetch(
            `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`,
            {},
            { cache: 'no-store' }
        )
    ]);

    if (config?.maintenanceMode === true) {
        redirect('/mantenimiento');
    }

    // --- LÓGICA DE COLOR DINÁMICO ---
    const primary = resolvePrimaryColor(appearance?.primaryColor);
    const foreground = getContrastColor(primary); // Calcula si el texto debe ser blanco o negro

    const configCompleta = { ...config, ...contact };

    return (
        <SettingsProvider config={configCompleta} appearance={appearance}>
            {/* INYECCIÓN DE VARIABLES CSS: 
                Esto permite que todo el sitio use var(--primary) y var(--primary-foreground)
            */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --primary: ${primary};
                    --primary-foreground: ${foreground};
                }
            `}} />

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
