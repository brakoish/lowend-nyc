import type { Metadata } from "next";
import { Jost, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = 'https://lowend-nyc.vercel.app';

export const metadata: Metadata = {
  title: "LOWEND NYC | Underground Electronic Music",
  description: "NYC's underground electronic music publication covering techno, house, garage, and bass music.",
  openGraph: {
    title: "LOWEND NYC | Underground Electronic Music",
    description: "NYC's underground electronic music publication covering techno, house, garage, and bass music.",
    type: "website",
    url: SITE_URL,
    siteName: "LOWEND NYC",
    images: [
      {
        url: `${SITE_URL}/images/og-default.png`,
        width: 1200,
        height: 630,
        alt: "LOWEND NYC - Underground Electronic Music",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOWEND NYC | Underground Electronic Music",
    description: "NYC's underground electronic music publication covering techno, house, garage, and bass music.",
    images: [`${SITE_URL}/images/og-default.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} ${inter.variable} ${jetbrainsMono.variable} font-body bg-page-bg text-text-primary antialiased`}
      >
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
