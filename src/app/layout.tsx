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

export const metadata: Metadata = {
  title: "sumit sute",
  description: "Sumit Sute’s personal dev page, featuring projects and writing, grounded in an engineering approach that favors simplicity, clear boundaries, and long-term maintainability.",  
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
  authors: [{ name: 'Sumit Sute', url: 'https://sumitsute.com/about' }],
  metadataBase: new URL('https://sumitsute.com'),
  openGraph: {
    title: "sumit sute",
    description: "Projects and writing by Sumit Sute, shaped by simplicity, clear boundaries, and long-term maintainability.",
    url: 'https://sumitsute.com',
    siteName: 'Sumit Sute Personal Dev Page',
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
    title: "sumit sute",
    description: "Projects and writing by Sumit Sute, shaped by simplicity, clear boundaries, and long-term maintainability.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;  
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable}`} suppressHydrationWarning>
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
