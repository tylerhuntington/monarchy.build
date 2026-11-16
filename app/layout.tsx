import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "@/components/header";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://monarchy.build"),
  title: {
    default: "Monarchy — Keep calm and DM the Queen.",
    template: "%s · Monarchy",
  },
  alternates: { canonical: "/" },
  description:
    "Build an empire of coding agents through one conversation. Monarchy gives you a Queen, a Secretary, and a team of 00 Agents.",
  openGraph: {
    type: "website",
    siteName: "Monarchy",
    title: "Keep calm and DM the Queen.",
    description: "One conversation. An empire of coding agents.",
    images: [{ url: "/og.png", width: 1254, height: 1254 }],
  },
  twitter: { card: "summary", images: ["/og.png"] },
};
export const viewport: Viewport = { themeColor: "#fafafa" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
      </body>
    </html>
  );
}
