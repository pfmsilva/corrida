import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "4run — Registo de Corridas",
  description: "Regista as tuas corridas, acompanha o ritmo e observa a tua evolução.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt">
        <body className={`${inter.className} bg-gray-50 min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
