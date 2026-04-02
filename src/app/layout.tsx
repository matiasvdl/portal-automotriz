import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/components/AuthProvider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* Envolvemos todo con los proveedores de datos */}
        <AuthProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}