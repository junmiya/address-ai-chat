import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { MockAuthProvider } from "@/features/auth/components/MockAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI代理応答チャットアプリ",
  description: "AIがオーナーの代理として応答・要約を行う高機能チャットアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <MockAuthProvider>
            {children}
          </MockAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
