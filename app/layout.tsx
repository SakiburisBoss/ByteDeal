import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Cart from "@/components/cart/cart";
import { SanityLive } from "@/sanity/lib/live";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "ByteDeal - Best Deals on Electronics, Fashion & More",
  description: "Discover amazing deals on electronics, fashion, home goods, and more at ByteDeal. Free shipping on orders over $15!",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#4f46e5' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ByteDeal',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'ByteDeal',
    title: 'ByteDeal - Best Deals on Electronics, Fashion & More',
    description: 'Discover amazing deals on electronics, fashion, home goods, and more at ByteDeal. Free shipping on orders over $15!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ByteDeal - Best Deals on Electronics, Fashion & More',
    description: 'Discover amazing deals on electronics, fashion, home goods, and more at ByteDeal. Free shipping on orders over $15!',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
          <Header />
          <main className="min-h-[calc(100vh-200px)]">
            {children}
          </main>
          <Cart />
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
