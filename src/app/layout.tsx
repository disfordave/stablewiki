import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WIKI_DESCRIPTION, WIKI_NAME } from "@/config";

import { Header, Footer } from "@/components";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: WIKI_NAME,
  description: WIKI_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="apple-mobile-web-app-title" content="StableWiki" />
        <meta
          name="theme-color"
          content="#f3f4f6"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#101828"
          media="(prefers-color-scheme: dark)"
        />
      </Head>
      <body
        className={`${geistSans.className} ${geistMono.variable} background antialiased`}
      >
        <div className="mx-auto min-h-screen max-w-2xl p-4">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
