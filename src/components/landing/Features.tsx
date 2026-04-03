"use client";

import { motion, type Variants } from "framer-motion";
import {
  Brain,
  ClipboardCheck,
  TrendingUp,
  Layers,
  Target,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Flashcards",
    description:
      "Our SM-2 spaced repetition algorithm surfaces cards exactly when you need them — so you remember more with less time studying.",
    gradient: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
  },
  {
    icon: ClipboardCheck,
    title: "Practice Tests",
    description:
      "Timed, competition-format tests that mirror real HOSA events. Track your accuracy by topic and identify weak spots fast.",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Earn XP, maintain daily streaks, and unlock mastery tiers as you advance. Visual dashboards show exactly where you stand.",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
  },
  {
    icon: Layers,
    title: "Multiple Study Modes",
    description:
      "Flip cards, multiple choice, type-the-answer, or matching games. Switch modes to keep studying fresh and effective.",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
  },
  {
    icon: Target,
    title: "Event-Specific Content",
    description:
      "Content organized by HOSA event — Medical Terminology, Health Career Display, Pharmacology, and more. Study exactly what you need.",
    gradient: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/15",
  },
  {
    icon: Trophy,
    title: "Compete & Climb",
    description:
      "Weekly leaderboards and leagues let you compete with chapter members. Nothing motivates like a little friendly competition.",
    gradient: "from-yellow-500/20 to-yellow-600/10",
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/15",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
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
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Dominate</span> Your Event
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Purpose-built tools for competitive HOSA members who want to place —
            not just participate.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`glass-card-light rounded-2xl p-6 bg-gradient-to-br ${feature.gradient} border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
