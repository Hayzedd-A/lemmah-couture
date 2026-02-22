import type { Metadata } from "next";
import "./globals.css";

// 1. Define constants for your metadata to keep it clean
const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "My Catalog";
const description = `Digital catalog for all products on ${businessName}`;
const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  title: businessName,
  description: description,
  // 2. Open Graph tags for WhatsApp/Facebook/LinkedIn
  openGraph: {
    title: businessName,
    description: description,
    url: siteUrl,
    siteName: businessName,
    images: [
      {
        url: "/favicon.png", // Path to your thumbnail image in the public folder
        width: 1200,
        height: 630,
        alt: businessName,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // 3. Favicon and Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
