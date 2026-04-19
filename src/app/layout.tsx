import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Satpol PP Situbondo | Sistem Pencarian Peraturan",
  description: "Aplikasi pencarian sanksi dan larangan Peraturan Daerah Kabupaten Situbondo untuk memudahkan penegakan hukum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
