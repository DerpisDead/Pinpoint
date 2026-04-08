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

      {/* EKG waveform 1 — 12% opacity */}
      <svg
        className="absolute left-0 right-0 w-full pointer-events-none"
        style={{ top: "38%", opacity: 0.12 }}
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,30 L120,30 L140,30 L155,18 L165,30 L175,30 L185,30 L195,2 L205,58 L215,30 L225,38 L235,30 L260,30 L380,30 L400,30 L415,18 L425,30 L435,30 L445,30 L455,2 L465,58 L475,30 L485,38 L495,30 L520,30 L640,30 L660,30 L675,18 L685,30 L695,30 L705,30 L715,2 L725,58 L735,30 L745,38 L755,30 L780,30 L900,30 L920,30 L935,18 L945,30 L955,30 L965,30 L975,2 L985,58 L995,30 L1005,38 L1015,30 L1040,30 L1200,30"
          fill="none"
          stroke="#A8C4E8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* EKG waveform 2 — 8% opacity, offset */}
      <svg
        className="absolute left-0 right-0 w-full pointer-events-none"
        style={{ top: "58%", opacity: 0.08 }}
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,30 L40,30 L55,18 L65,30 L75,30 L85,30 L95,2 L105,58 L115,30 L125,38 L135,30 L160,30 L280,30 L300,30 L315,18 L325,30 L335,30 L345,30 L355,2 L365,58 L375,30 L385,38 L395,30 L420,30 L540,30 L560,30 L575,18 L585,30 L595,30 L605,30 L615,2 L625,58 L635,30 L645,38 L655,30 L680,30 L800,30 L820,30 L835,18 L845,30 L855,30 L865,30 L875,2 L885,58 L895,30 L905,38 L915,30 L940,30 L1200,30"
          fill="none"
          stroke="#A8C4E8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Rod of Asclepius — right side, 6% opacity */}
      <svg
        className="absolute pointer-events-none hidden sm:block"
        style={{ right: "8%", top: "15%", opacity: 0.06, height: "70%" }}
        viewBox="0 0 80 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="40" y1="10" x2="40" y2="195" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="10" r="5" fill="none" stroke="white" strokeWidth="2" />
        <path
          d="M40,30 C60,40 60,55 40,65 C20,75 20,90 40,100 C60,110 60,125 40,135 C20,145 20,160 40,170 C60,180 60,190 50,195"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="195" rx="5" ry="3.5" fill="none" stroke="white" strokeWidth="2" />
        <path d="M53,194 L57,191 M53,196 L57,199" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* DNA Helix — left side, 5% opacity */}
      <svg
        className="absolute pointer-events-none hidden sm:block"
        style={{ left: "6%", top: "10%", opacity: 0.05, height: "75%" }}
        viewBox="0 0 60 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30,0 C60,20 60,40 30,60 C0,80 0,100 30,120 C60,140 60,160 30,180 C0,200 0,220 30,240"
          fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
        />
        <path
          d="M30,0 C0,20 0,40 30,60 C60,80 60,100 30,120 C0,140 0,160 30,180 C60,200 60,220 30,240"
          fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
        />
        <line x1="8" y1="30" x2="52" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="8" y1="90" x2="52" y2="90" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="8" y1="150" x2="52" y2="150" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="8" y1="210" x2="52" y2="210" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>

      {/* Star of Life — bottom-right corner, 4% opacity */}
      <svg
        className="absolute pointer-events-none"
        style={{ right: "3%", bottom: "8%", opacity: 0.04, width: 120, height: 120 }}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(50,50)">
          <rect x="-5" y="-40" width="10" height="80" rx="5" fill="white" />
          <rect x="-5" y="-40" width="10" height="80" rx="5" fill="white" transform="rotate(60)" />
          <rect x="-5" y="-40" width="10" height="80" rx="5" fill="white" transform="rotate(120)" />
        </g>
      </svg>

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
