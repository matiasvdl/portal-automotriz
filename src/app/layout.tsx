import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* Aquí Next.js meterá el layout de (main) o de admin */}
        {children}
      </body>
    </html>
  );
}