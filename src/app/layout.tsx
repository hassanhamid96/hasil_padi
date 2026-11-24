import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Laporan Hasil & Kos Penanaman Padi (2020 - 2026)",
  description: "Sistem Analisis Prestasi Hasil Padi, Subsidi Kerajaan, Perincian Kos Operasi & Resit Timbangan Bendang Sungai Baru (11.5 Relong)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-emerald-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
