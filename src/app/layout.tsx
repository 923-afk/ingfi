import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "工程師傅媒合平台 | Home Repair Finder",
  description: "建立維修需求，立即找到值得信賴的師傅。Post your repair need and let trusted pros help you out.",
  keywords: ["維修", "師傅", "工程師", "home repair", "handyman", "professional services"],
  openGraph: {
    title: "工程師傅媒合平台",
    description: "建立維修需求，立即找到值得信賴的師傅。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
