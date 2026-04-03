"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I placed 2nd at State in Medical Terminology after using PinPoint for 3 weeks. The spaced repetition actually works — I retained so much more than just re-reading my notes.",
    name: "Priya M.",
    role: "HOSA State Qualifier · Medical Terminology",
    initials: "PM",
    color: "bg-blue-500",
  },
  {
    quote:
      "The practice tests are eerily similar to the actual competition format. I felt so prepared walking in. PinPoint made studying feel like a game, not a chore.",
    name: "Jordan T.",
    role: "HOSA Chapter President · Pharmacology",
    initials: "JT",
    color: "bg-purple-500",
  },
  {
    quote:
      "Our entire chapter switched to PinPoint before regionals. Three of us placed in the top 10. The leaderboard definitely added some friendly motivation!",
    name: "Marcus L.",
    role: "HOSA Member · Health Career Display",
    initials: "ML",
    color: "bg-cyan-500",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4 border border-blue-100">
            Social Proof
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Members Who{" "}
            <span className="gradient-text">Actually Placed</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Don't take our word for it — here's what HOSA members say after
            using PinPoint before competition.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
