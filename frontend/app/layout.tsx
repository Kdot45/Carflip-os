import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { TopNav } from "@/components/nav/TopNav";

export const metadata: Metadata = {
  title: "CarFlip OS",
  description: "Evaluate private-party car deals and protect your profit before you buy.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <TopNav />
          <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6 sm:pb-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
