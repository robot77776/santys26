import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Тайный Санта 2026",
  description: "Новогодняя игра Тайный Санта",
  manifest: "/manifest.webmanifest",
  themeColor: "#10251d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
