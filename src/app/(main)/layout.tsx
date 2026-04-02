import { client } from '@/sanity/lib/client';
import { redirect } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // Agregamos los campos explícitos para que Sanity los envíe al contexto
    const [config, appearance] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { next: { revalidate: 0 } }),
        client.fetch(`*[_id == "appearance-settings"][0]{
            brandName,
            logo,
            splitText,
            isJoined,
            minDepositPercent,
            minIncome,         // <-- Campo nuevo
            minWorkExperience  // <-- Campo nuevo
        }`, {}, { next: { revalidate: 0 } })
    ]);

    if (config?.maintenanceMode === true) {
        redirect('/mantenimiento');
    }

    return (
        <SettingsProvider config={config} appearance={appearance}>
            <Navigation config={config} />
            <main>{children}</main>
            <Footer config={config} />
        </SettingsProvider>
    );
}