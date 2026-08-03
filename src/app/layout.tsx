import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalesFlow | Fibre Sales CRM",
  description: "A focused CRM workspace for fibre sales teams.",
  applicationName: "SalesFlow",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SalesFlow" },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('salesflow-design')||'theme-1';var m=localStorage.getItem('salesflow-mode')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.design=s;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()` }} /></head>
      <body className="min-h-full flex flex-col"><div className="min-h-full flex-1 pb-20 lg:pb-0">{children}</div><MobileBottomNav /></body>
    </html>
  );
}
