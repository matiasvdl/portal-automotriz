import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SettingsProvider } from "@/context/SettingsContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col bg-[#F7F8FA]">
        <SettingsProvider>
          <AuthProvider>
            {/* flex-grow hace que este contenedor ocupe todo el espacio y mande el footer al fondo */}
            <main className="flex-grow flex flex-col">
              {children}
            </main>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}