import { client } from '@/sanity/lib/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // Buscamos la config una sola vez para toda la web
    const config = await client.fetch(`*[_type == "siteConfig"][0]`);

    return (
        <>
            <Navigation config={config} />
            <main>{children}</main>
            <Footer config={config} />
        </>
    );
}