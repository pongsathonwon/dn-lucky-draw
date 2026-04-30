import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ResultToast({
  isOpen,
  customerName,
  spinCount,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: "spring", damping: 18, stiffness: 250 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 border border-purple-400/40 shadow-2xl rounded-2xl px-8 py-5 flex flex-col items-center gap-1 min-w-[260px]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-xl">
                {customerName}
              </span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-white/80 text-base">
              ถูกสุ่มได้{" "}
              <span className="text-white font-bold">{spinCount}</span> รอบ
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
