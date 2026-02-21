import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookmark Digest",
  description: "Digest your Twitter bookmarks through second-round curation",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bookmark Digest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100 min-h-dvh`}>
        <div className="max-w-lg mx-auto px-4">
          <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur py-4 border-b border-zinc-800/50">
            <h1 className="text-lg font-bold tracking-tight">Bookmark Digest</h1>
          </header>
          <main className="py-4">{children}</main>
        </div>
        <Nav />
      </body>
    </html>
  );
}
