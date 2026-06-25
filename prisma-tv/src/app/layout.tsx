import type { Metadata, Viewport } from "next";
import { Oswald, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PrismaSplash from "@/components/ui/PrismaSplash";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "PRISMA TV",
  description: "Sala de controle da Rede Prisma — sinal privado da campanha.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "PRISMA TV",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body>
        <ServiceWorkerRegister />
        {children}
        <PrismaSplash />
      </body>
    </html>
  );
}