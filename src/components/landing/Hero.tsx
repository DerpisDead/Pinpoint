"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

const AVATARS = ["A", "B", "C", "D", "E"];
const AVATAR_COLORS = [
  "bg-[#1C3F6E]",
  "bg-[#8B1A2D]",
  "bg-[#2C5490]",
  "bg-[#6B1523]",
  "bg-[#1C3F6E]",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D1B3E]">
      {/* Background orbs */}
      <div
        className="orb-float-slow absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #1C3F6E, transparent)" }}
      />
      <div
        className="orb-float-medium absolute top-1/3 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B1A2D, transparent)" }}
      />
      <div
        className="orb-float-slow absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #1C3F6E, transparent)",
          animationDelay: "3s",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(28,63,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(28,63,110,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1C3F6E]/40 bg-[#1C3F6E]/15 text-[#A8C4E8] text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#8B1A2D] animate-pulse" />
          Built for HOSA. Designed to Win.
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6"
        >
          Study{" "}
          <span className="gradient-text">Smarter.</span>
          <br />
          Compete Harder.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The AI-powered study platform built for HOSA members. Flashcards,
          practice tests, and spaced repetition — designed to help you{" "}
          <span className="text-white font-medium">win at competition.</span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-full gradient-btn shadow-lg shadow-[#8B1A2D]/30 text-base"
          >
            Start Studying Free
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium px-8 py-3.5 rounded-full border border-white/20 hover:border-white/40 transition-colors duration-200 text-base"
          >
            <PlayCircle size={18} />
            See How It Works
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500"
        >
          <div className="flex -space-x-2">
            {AVATARS.map((letter, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i]} border-2 border-[#0D1B3E] flex items-center justify-center text-white text-xs font-bold`}
              >
                {letter}
              </div>
            ))}
          </div>
          <span className="text-gray-400">
            Trusted by{" "}
            <span className="text-gray-200 font-medium">HOSA members</span>{" "}
            across Illinois
          </span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1B3E] to-transparent pointer-events-none" />
    </section>
  );
}
