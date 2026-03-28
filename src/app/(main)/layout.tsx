import { client } from '@/sanity/lib/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SettingsProvider } from '@/context/SettingsContext' // Importamos el proveedor

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // Buscamos la config general (SEO, nombres, menús)
    const config = await client.fetch(`*[_type == "siteConfig"][0]`);

    return (
        <SettingsProvider>
            {/* Al envolver todo aquí, cualquier página o componente 
               dentro de la web podrá usar const { contact } = useSettings() 
            */}

            <Navigation config={config} />

            <main>{children}</main>

            <Footer config={config} />
        </SettingsProvider>
    );
}