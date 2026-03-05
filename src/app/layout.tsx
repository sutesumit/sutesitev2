import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"]
})

const SITE_URL = 'https://sumitsute.com';
const SITE_NAME = 'Sumit Sute Personal Dev Page';
const SITE_DESCRIPTION = "Sumit Sute's personal dev page, featuring projects and writing, grounded in an engineering approach that favors simplicity, clear boundaries, and long-term maintainability.";
const OG_DESCRIPTION = "Projects and writing by Sumit Sute, shaped by simplicity, clear boundaries, and long-term maintainability.";

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
  authors: [{ name: 'Sumit Sute', url: `${SITE_URL}/about` }],
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
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: '/sumit-sute-homepage.jpg',
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
    description: OG_DESCRIPTION,
    images: [
      {
        url: '/sumit-sute-homepage.jpg',
        alt: 'Screenshot of Sumit Sute\'s Dev Page in light mode',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  author: {
    '@type': 'Person',
    name: 'Sumit Sute',
    url: SITE_URL,
  },
};

const jsonLdPerson = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Sumit Sute',
  url: SITE_URL,
  sameAs: [],
  jobTitle: 'Software Engineer',
  knowsAbout: ['Web Development', 'TypeScript', 'React', 'Next.js', 'System Design'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;  
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
        />
      </head>
      <body className="font-roboto-mono dark:text-slate-300 overflow-y-scroll" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
