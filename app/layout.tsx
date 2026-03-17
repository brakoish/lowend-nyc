import type { Metadata } from "next";
import { Jost, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${jost.variable} ${inter.variable} ${jetbrainsMono.variable} font-body bg-page-bg text-text-primary antialiased`}
      >
        <Navigation />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
