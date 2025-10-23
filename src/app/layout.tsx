import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { WIKI_DESCRIPTION, WIKI_NAME } from "@/config";

import { Header, Footer } from "@/components";
import Head from "next/head";
import { TransitionLinkButton } from "@/components/ui";
import { ArrowUpIcon } from "@heroicons/react/24/solid";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
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
        <meta name="apple-mobile-web-app-title" content="StableWiki" />
      </Head>
      <body
        className={`${ibmPlexSans.className} ${ibmPlexMono.style} bg-white antialiased sm:bg-gray-100 dark:bg-gray-800 sm:dark:bg-gray-900`}
        id="top"
      >
        <div className="h-full min-h-screen w-full bg-gray-100 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
          <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-0 sm:p-4">
            <Header />
            <main className="flex-grow overflow-auto rounded-2xl bg-white p-4 dark:bg-gray-800">
              {children}
            </main>
            <Footer />
          </div>
          <TransitionLinkButton
            href="#top"
            className="fixed end-6 bottom-6 aspect-square size-12 bg-gray-300/50 hover:bg-gray-400/50 dark:bg-gray-700/50 dark:hover:bg-gray-600/50"
            title="Back to Top"
          >
            <ArrowUpIcon className="inline size-5" />
          </TransitionLinkButton>
        </div>
      </body>
    </html>
  );
}
