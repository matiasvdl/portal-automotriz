import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SettingsProvider } from "@/context/SettingsContext"; // Importamos el proveedor de ajustes

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* El SettingsProvider envuelve todo para que incluso el Login 
          pueda saber cuál es el número de WhatsApp de soporte.
        */}
        <SettingsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}