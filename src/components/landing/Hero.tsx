"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

const AVATARS = ["A", "B", "C", "D", "E"];
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-pink-500",
];

/* ─── Medical symbol texture components ────────────────────────────────────
   All rendered at very low opacity so they register subconsciously.
   "Felt, not read." — they make the page feel medical without looking
   like a hospital brochure.
─────────────────────────────────────────────────────────────────────────── */

/**
 * EKG / heartbeat lines — two full-width repeating waveforms at different
 * heights and opacities. The QRS spike is the instantly recognizable part.
 * Line 1: blue at 12% opacity (~38% down the hero)
 * Line 2: purple at 7% opacity (~63% down the hero), offset by half a tile
 */
function EkgLines() {
  return (
    <>
      {/* Line 1 */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{ top: "38%" }}
      >
        <svg width="100%" height="60">
          <defs>
            <pattern
              id="ekgTile1"
              x="0"
              y="0"
              width="220"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,30 L38,30 L46,25 L54,30 L63,30 L66,35 L70,4 L74,46 L78,30 L91,20 L104,30 L220,30"
                stroke="#3B82F6"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="60" fill="url(#ekgTile1)" opacity="0.12" />
        </svg>
      </div>

      {/* Line 2 — starts half a tile offset, purple, softer */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{ top: "63%" }}
      >
        <svg width="100%" height="60">
          <defs>
            <pattern
              id="ekgTile2"
              x="-110"
              y="0"
              width="220"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,30 L38,30 L46,25 L54,30 L63,30 L66,35 L70,4 L74,46 L78,30 L91,20 L104,30 L220,30"
                stroke="#8B5CF6"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="60" fill="url(#ekgTile2)" opacity="0.07" />
        </svg>
      </div>
    </>
  );
}

/**
 * DNA double helix — left side of the hero at 5% opacity.
 * Two sinusoidal strands with ladder rungs. Represents the science
 * foundation of health professions. Hidden on mobile to avoid overlap.
 */
function DnaHelix() {
  return (
    <div
      className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
      style={{ opacity: 0.05 }}
    >
      <svg width="100" height="420" viewBox="0 0 100 420" fill="none">
        {/* Strand A — starts right */}
        <path
          d="M50,0 C50,30 75,30 75,50 C75,70 50,70 50,100
             C50,130 25,130 25,150 C25,170 50,170 50,200
             C50,230 75,230 75,250 C75,270 50,270 50,300
             C50,330 25,330 25,350 C25,370 50,370 50,400"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Strand B — starts left (180° out of phase) */}
        <path
          d="M50,0 C50,30 25,30 25,50 C25,70 50,70 50,100
             C50,130 75,130 75,150 C75,170 50,170 50,200
             C50,230 25,230 25,250 C25,270 50,270 50,300
             C50,330 75,330 75,350 C75,370 50,370 50,400"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Ladder rungs — at peak separation points and intermediates */}
        <line x1="33" y1="25"  x2="67" y2="25"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="50"  x2="75" y2="50"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="75"  x2="67" y2="75"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="125" x2="67" y2="125" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="150" x2="75" y2="150" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="175" x2="67" y2="175" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="225" x2="67" y2="225" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="250" x2="75" y2="250" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="275" x2="67" y2="275" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="325" x2="67" y2="325" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="350" x2="75" y2="350" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="375" x2="67" y2="375" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/**
 * Rod of Asclepius — right side at 6% opacity.
 * The historically correct single-snake medical symbol (not the caduceus).
 * HOSA students who know the difference will notice. Hidden on mobile.
 */
function RodOfAsclepius() {
  return (
    <div
      className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
      style={{ opacity: 0.06 }}
    >
      <svg width="100" height="340" viewBox="0 0 100 340" fill="none">
        {/* Staff */}
        <line
          x1="50" y1="330"
          x2="50" y2="28"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Shepherd's crook at top */}
        <path
          d="M50,28 C50,10 68,5 70,18 C72,30 58,32 52,27"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Snake body — winds around the staff */}
        <path
          d="M35,310 C35,292 65,278 65,258
             C65,238 35,218 35,198
             C35,178 65,158 65,138
             C65,118 35,98  35,78
             C35,62  55,55  55,52"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Snake head */}
        <ellipse cx="54" cy="48" rx="8" ry="6" stroke="white" strokeWidth="2" />
        {/* Eye */}
        <circle cx="57" cy="46" r="1.2" fill="white" />
        {/* Tongue */}
        <path
          d="M51,42 L48,37 M51,42 L54,37"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Star of Life — small six-pointed star in the bottom-right corner at 4%.
 * Subtle nod to the EMT / emergency preparedness event.
 */
function StarOfLife() {
  return (
    <div
      className="absolute bottom-16 right-28 pointer-events-none"
      style={{ opacity: 0.04 }}
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <path
          d="M40,5 L48.5,25.3 L70.3,22.5 L57,40
             L70.3,57.5 L48.5,54.7 L40,75
             L31.5,54.7 L9.7,57.5 L23,40
             L9.7,22.5 L31.5,25.3 Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B1120]">

      {/* ── Depth orbs ── */}
      <div
        className="orb-float-slow absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }}
      />
      <div
        className="orb-float-medium absolute top-1/3 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }}
      />
      <div
        className="orb-float-slow absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #06B6D4, transparent)",
          animationDelay: "3s",
        }}
      />

      {/* ── Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Medical symbol textures ── */}
      <EkgLines />
      <DnaHelix />
      <RodOfAsclepius />
      <StarOfLife />

      {/* ── Foreground content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
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

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-full gradient-btn shadow-lg shadow-blue-500/30 text-base"
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

        {/* Social proof */}
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
                className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i]} border-2 border-[#0B1120] flex items-center justify-center text-white text-xs font-bold`}
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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1120] to-transparent pointer-events-none" />
    </section>
  );
}
