import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // 1. Traemos la config y la apariencia en paralelo (más rápido)
    const [config, appearance] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { next: { revalidate: 0 } }),
        client.fetch(`*[_id == "appearance-settings"][0]`, {}, { next: { revalidate: 0 } })
    ]);

    // 2. Si el modo mantenimiento está ON, redirigimos
    if (config?.maintenanceMode === true) {
        redirect('/mantenimiento');
    }

    return (
        // Pasamos tanto config como appearance al provider
        <SettingsProvider config={config} appearance={appearance}>
            <Navigation config={config} />

            <main>{children}</main>

            <Footer config={config} />
        </SettingsProvider>
    );
}