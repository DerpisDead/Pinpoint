import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "PinPoint — Study Smarter. Compete Harder.",
  description:
    "The study platform built for HOSA members. Spaced repetition flashcards, practice tests, XP & leagues — designed to help you win at competition.",
  openGraph: {
    title: "PinPoint — Study Smarter. Compete Harder.",
    description:
      "Spaced repetition flashcards and practice tests designed for HOSA competitors. Earn XP, climb leagues, and master every event.",
    type: "website",
    url: "https://pinpoint.study",
    siteName: "PinPoint",
  },
  twitter: {
    card: "summary_large_image",
    title: "PinPoint — Study Smarter. Compete Harder.",
    description: "Spaced repetition flashcards and practice tests for HOSA competitors.",
  },
  keywords: ["HOSA", "study", "flashcards", "spaced repetition", "competitive", "CTSO", "practice tests", "health occupations"],
};
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
