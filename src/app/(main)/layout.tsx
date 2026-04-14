import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // 1. Ahora pedimos tres cosas: Configuración, Apariencia y Contacto
    const [config, appearance, contact] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { next: { revalidate: 0 } }),
        client.fetch(`*[_type == "appearance"][0]{
            brandName, logo, splitText, isJoined,
            minDepositPercent, minIncome, minWorkExperience  
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
            <Navigation config={configCompleta} />
            <main>{children}</main>
            <Footer config={configCompleta} />
        </SettingsProvider>
    );
}