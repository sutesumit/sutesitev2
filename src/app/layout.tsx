import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";

import { ThemeProvider } from "next-themes";

import Footer, { VisitorAnalytics } from "../components/layout/Footer";
import Header from "../components/layout/Header";
import {
  DEFAULT_OG_IMAGE,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_URL,
} from "@/config/metadata";
import { buildPersonSchema, buildWebsiteSchema, renderJsonLd } from "@/lib/metadata/schema";
import "./globals.css";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    default: 'sumit sute',
    template: '%s | sumit sute',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'developer',
    'portfolio',
    'Sumit Sute',
    'web development',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'software engineer',
    'full stack developer',
    'web systems',
    'maintainable software',
    'system design',
    'engineering principles',
    'personal dev page',
    'developer projects',
    'developer blog',
    'engineering writing'
  ],
  authors: [{ name: SITE_AUTHOR, url: `${SITE_URL}/about` }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'sumit sute',
    description: SITE_OG_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 800,
        height: 600,
        alt: 'Screenshot of Sumit Sute\'s Dev Page',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sumit sute',
    description: SITE_OG_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: 'Screenshot of Sumit Sute\'s Dev Page in light mode',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={robotoMono.variable} suppressHydrationWarning>
      <head>
        {renderJsonLd(buildWebsiteSchema())}
        {renderJsonLd(buildPersonSchema())}
      </head>
      <body className="font-roboto-mono dark:text-slate-300 overflow-y-scroll" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <VisitorAnalytics>
            <main>{children}</main>
            <Footer />
          </VisitorAnalytics>
        </ThemeProvider>
      </body>
    </html>
  );
}
