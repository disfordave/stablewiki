/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { WIKI_DESCRIPTION, WIKI_NAME } from "@/config";

import { Header, Footer } from "@/components";
import Head from "next/head";
import { BackToTopButton } from "@/components/ui";
import { getThemeColor } from "@/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: [
    "latin",
    "latin-ext",
    "cyrillic",
    "cyrillic-ext",
    "greek",
    "vietnamese",
  ],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: WIKI_NAME,
  description: WIKI_DESCRIPTION,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#27272a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <Head>
        <meta name="apple-mobile-web-app-title" content="SidWiki" />
      </Head>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} bg-white antialiased ${getThemeColor.etc.selection} sm:bg-zinc-100 dark:bg-zinc-800 sm:dark:bg-zinc-900`}
        id="up"
      >
        <div className="h-full min-h-screen w-full bg-zinc-100 text-zinc-900 transition-colors duration-300 dark:bg-zinc-900 dark:text-zinc-100">
          <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-0 sm:p-4">
            <Header />
            <main className="min-h-[calc(100vh-12rem)] overflow-auto rounded-2xl bg-white p-4 dark:bg-zinc-800">
              {children}
            </main>
            <Footer />
          </div>
          <BackToTopButton />
        </div>
      </body>
    </html>
  );
}
