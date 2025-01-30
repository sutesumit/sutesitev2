import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
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
  description: "Sumit Sute – Full-Stack Developer specializing in React, Next.js & modern web technologies. Explore my projects and skills.",  
  keywords: ['developer', 'portfolio', 'Sumit Sute', 'web development', 'JavaScript', 'TypeScript', 'React', 'Next.js'],
  authors: [{ name: 'Sumit Sute', url: 'https://sumitsute.com/about' }],
  metadataBase: new URL('https://sumitsute.com'),
  openGraph: {
    title: "<sumitsute />",
    description: "Explore the portfolio of Sumit Sute, a passionate web developer specializing in modern web technologies.",
    url: 'https://sumitsute.com',
    siteName: 'Sumit Sute Portfolio',
    images: [
      {
        url: '',
        width: 800,
        height: 600,
        alt: 'Screenshot of Sumit Sute\'s portfolio',
      },
    ],
    type: 'website',
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
      <body className="font-roboto-mono dark:text-slate-300" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
