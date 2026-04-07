"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Pick Your Events",
    description:
      "Choose which HOSA events you're competing in — Medical Terminology, Pharmacology, Health Career Display, and more. PinPoint builds your custom study plan instantly.",
    color: "text-[#A8C4E8]",
    border: "border-[#1C3F6E]/40",
    bg: "bg-[#1C3F6E]/15",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Study with AI",
    description:
      "Our adaptive flashcard engine learns what you know and what you don't. It schedules reviews at the perfect moment so nothing falls through the cracks.",
    color: "text-[#D4828E]",
    border: "border-[#8B1A2D]/40",
    bg: "bg-[#8B1A2D]/15",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track & Compete",
    description:
      "Watch your mastery score grow event by event. Climb the weekly leaderboard, maintain your streak, and hit the competition floor with confidence.",
    color: "text-[#A8C4E8]",
    border: "border-[#1C3F6E]/40",
    bg: "bg-[#1C3F6E]/15",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-[#0D1B3E] relative overflow-hidden"
    >
      {/* Subtle orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B1A2D, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #1C3F6E, transparent)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[#A8C4E8] text-sm font-medium mb-4 border border-white/10">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            From Zero to{" "}
            <span className="gradient-text">Competition-Ready</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Three simple steps to go from stressed about your event to walking
            in with confidence.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-[#1C3F6E]/30 via-[#8B1A2D]/50 to-[#1C3F6E]/30 pointer-events-none" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                {/* Step indicator */}
                <div className={`relative w-24 h-24 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center mb-6`}>
                  <Icon size={32} className={step.color} />
                  <span
                    className={`absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#0D1B3E] border ${step.border} flex items-center justify-center text-xs font-bold ${step.color}`}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
