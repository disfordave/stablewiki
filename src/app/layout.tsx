import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  WIKI_COPYRIGHT_HOLDER,
  WIKI_COPYRIGHT_HOLDER_URL,
  WIKI_DESCRIPTION,
  WIKI_NAME,
} from "@/config";

import Header from "@/components/Header";
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
      </Head>
      <body
        className={`${geistSans.className} ${geistMono.variable} background antialiased`}
      >
        <div className="mx-auto min-h-screen max-w-2xl p-4">
          <Header />
          {children}
          <footer className="mt-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()}{" "}
              <a
                href={WIKI_COPYRIGHT_HOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {WIKI_COPYRIGHT_HOLDER}
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
