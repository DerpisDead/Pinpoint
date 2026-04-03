"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  level: number;
  isVisible: boolean;
  onDismiss: () => void;
};

export default function LevelUpModal({ level, isVisible, onDismiss }: Props) {
  useEffect(() => {
    if (!isVisible) return;
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"] });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.5 } });
        confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.5 } });
      }, 300);
    });
  }, [isVisible]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === "Escape") onDismiss(); };
    if (isVisible) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-gray-500" />
            </button>

            <div className="text-5xl mb-4">⚡</div>

            <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-1">
              Achievement Unlocked
            </p>
            <h2 className="text-2xl font-black tracking-tight mb-3 gradient-text">
              LEVEL UP!
            </h2>

            <div className="w-24 h-24 rounded-full gradient-btn flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
              <span className="text-4xl font-black text-white">{level}</span>
            </div>

            <p className="text-gray-500 text-sm mb-6">
              You reached <span className="font-bold text-gray-800">Level {level}</span>. Keep studying to unlock more!
            </p>

            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full gradient-btn text-white font-semibold text-sm shadow-md shadow-blue-500/25"
            >
              Continue →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
