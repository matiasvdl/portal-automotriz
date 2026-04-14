import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Términos y Condiciones | VDL Motors",
    description: "Consulta los términos legales y condiciones de uso de VDL Motors.",
};

export default function TerminosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}