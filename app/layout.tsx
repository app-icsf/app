import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ICSF Federation",
  description: "Comunidad global de coaches y speakers",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ICSF" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#0B192C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
      </head>
      <body className="bg-surface text-on-surface font-body-md min-h-screen antialiased selection:bg-surface-variant">
        {children}
      </body>
    </html>
  );
}
