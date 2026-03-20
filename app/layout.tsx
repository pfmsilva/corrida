// Root layout — wraps every page in the app.
// We use the Inter font and apply the global CSS.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Corrida — Registo de Corridas",
  description: "Regista as tuas corridas, acompanha o ritmo e observa a tua evolução.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
