"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700" />

      {/* Texture orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Zap size={28} className="text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Ready to Start Winning?
          </h2>
          <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
            Join HOSA members who study smarter with PinPoint. Free to start,
            designed to help you place.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold px-8 py-3.5 rounded-full bg-white hover:bg-blue-50 transition-colors duration-200 shadow-xl shadow-black/20 text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <p className="text-blue-200 text-sm">No credit card required</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
