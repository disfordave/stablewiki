/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  // IBM_Plex_Sans,
  // IBM_Plex_Sans_KR,
  Noto_Sans_KR,
  Inter,
} from "next/font/google";
import "./globals.css";
import { WIKI_DESCRIPTION, WIKI_NAME } from "@/config";

import { Header, Footer } from "@/components";
import Head from "next/head";
import { BackToTopButton } from "@/components/ui";

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

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// const ibmPlexSans = IBM_Plex_Sans({
//   variable: "--font-ibm-plex-sans",
//   subsets: [
//     "latin",
//     "latin-ext",
//     "cyrillic",
//     "cyrillic-ext",
//     "greek",
//     "vietnamese",
//   ],
// });

// const ibmPlexSansKR = IBM_Plex_Sans_KR({
//   variable: "--font-ibm-plex-sans-kr",
//   subsets: ["latin", "latin-ext"],
//   weight: ["100", "200", "300", "400", "500", "600", "700"],
// });

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
    { media: "(prefers-color-scheme: dark)", color: "#1e2939" },
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
        className={`${inter.variable} ${notoSansKR.variable} ${ibmPlexMono.variable} bg-white antialiased selection:bg-violet-500/35 sm:bg-gray-100 dark:bg-gray-800 sm:dark:bg-gray-900`}
        id="up"
      >
        <div className="h-full min-h-screen w-full bg-gray-100 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
          <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-0 sm:p-4">
            <Header />
            <main className="flex-grow overflow-auto rounded-2xl bg-white p-4 dark:bg-gray-800">
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
