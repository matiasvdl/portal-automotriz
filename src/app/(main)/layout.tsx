import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // 1. Traemos toda la config de una sola vez (incluyendo el modo mantenimiento)
    const config = await client.fetch(
        `*[_type == "siteConfig"][0]`,
        {},
        { next: { revalidate: 0 } }
    );

    // 2. Si el modo mantenimiento está ON, redirigimos
    // Al estar dentro de (main), no bloquea la página de /mantenimiento ni el /admin
    if (config?.maintenanceMode === true) {
        redirect('/mantenimiento');
    }

    return (
        <SettingsProvider>
            {/* Pasamos la config a la Navigation y Footer para que usen tus menús de Sanity */}
            <Navigation config={config} />

            <main>{children}</main>

            <Footer config={config} />
        </SettingsProvider>
    );
}