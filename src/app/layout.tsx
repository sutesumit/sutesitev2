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
  title: "<sumitsute />",
  description: "Sumit Sute's Developer Portfolio Website",
  keywords: ['developer', 'portfolio', 'Sumit Sute', 'web development', 'JavaScript', 'React', 'Next.js'],
  authors: [{ name: 'Sumit Sute', url: 'https://sumitsute.com/about' }],
  metadataBase: new URL('https://sumitsute.com'),
  openGraph: {
    title: "<sumitsute />",
    description: "Explore the portfolio of Sumit Sute, a passionate web developer specializing in modern web technologies.",
    url: 'https://sumitsute.com',
    siteName: 'Sumit Sute Portfolio',
    images: [
      {
        url: 'https://sumitsute.com/images/portfolio.jpg',
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
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
