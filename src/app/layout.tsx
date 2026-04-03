import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PinPoint — Study Smarter. Compete Harder.",
  description:
    "The AI-powered study platform built for HOSA members. Flashcards, practice tests, and spaced repetition — designed to help you win at competition.",
  keywords: ["HOSA", "study", "flashcards", "competitive", "CTSO", "practice tests"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </body>
    </html>
  );
}
