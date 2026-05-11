import { Metadata } from "next";
import { client } from '@/sanity/lib/client'

// PASO B: Convertimos los metadatos estáticos en dinámicos
export async function generateMetadata(): Promise<Metadata> {
    // Buscamos el Nombre de la Empresa y las descripciones en Sanity
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    const name = config?.siteName || ''
    const description = config?.seoDescriptions?.terminos || `Consulta los términos legales y condiciones de uso de ${name}.`

    return {
        title: 'Términos y Condiciones',
        description: description,
    };
}

export default function TerminosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}