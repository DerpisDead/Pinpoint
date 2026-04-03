"use client";

import { motion, AnimatePresence } from "framer-motion";

export type XpNotif = { id: number; amount: number };

type Props = {
  notifications: XpNotif[];
};

export default function XpNotification({ notifications }: Props) {
  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -56, scale: 0.9 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex items-center gap-1.5 bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-purple-500/30"
          >
            <span className="text-yellow-300">⚡</span>
            +{n.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
