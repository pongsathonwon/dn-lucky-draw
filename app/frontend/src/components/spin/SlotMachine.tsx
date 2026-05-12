import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Customer } from "@/types/supabase";

interface SlotMachineProps {
  customers: Customer[];
  isSpinning: boolean;
  onSpinEnd: () => void;
  duration?: number;
  winnerIndex: number | null;
}

export default function SlotMachine({
  customers,
  isSpinning,
  onSpinEnd,
  duration = 5,
  winnerIndex,
}: SlotMachineProps) {
  const [displayItems, setDisplayItems] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getThree = (arr: Customer[], idx: number): [string, string, string] => {
    if (arr.length === 0) return ["", "", ""];
    const len = arr.length;
    const prev = arr[(((idx - 1) % len) + len) % len]?.name ?? "";
    const curr = arr[idx % len]?.name ?? "";
    const next = arr[(idx + 1) % len]?.name ?? "";
    return [prev, curr, next];
  };

  useEffect(() => {
    if (customers.length > 0) {
      const randomIdx = Math.floor(Math.random() * customers.length);
      setDisplayItems(getThree(customers, randomIdx));
    }
  }, [customers.length]);

  useEffect(() => {
    if (
      !isSpinning ||
      winnerIndex === null ||
      winnerIndex === undefined ||
      customers.length === 0
    )
      return;

    setIsAnimating(true);
    const durationMs = duration * 1000;
    const startTime = Date.now();

    let currentIdx = 0;
    let delay = 60;

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / durationMs;

      if (progress > 0.7) {
        delay = 60 + Math.floor(((progress - 0.7) / 0.3) * 440);
      }

      currentIdx = (currentIdx + 1) % customers.length;
      setDisplayItems(getThree(customers, currentIdx));

      if (elapsed < durationMs - 400) {
        timeoutRef.current = setTimeout(spin, delay);
      } else {
        setTimeout(() => {
          setDisplayItems(getThree(customers, winnerIndex));
          setIsAnimating(false);
          if (onSpinEnd) onSpinEnd();
        }, 400);
      }
    };

    timeoutRef.current = setTimeout(spin, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isSpinning, winnerIndex]);

  const [prevName, currName, nextName] = displayItems;

  return (
    <div className="flex flex-col items-center gap-0 w-full max-w-md mx-auto">
      <div className="relative w-full backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative py-4 px-6">
          <div
            className="absolute left-4 right-4 rounded-xl bg-white/10 border border-white/20"
            style={{ top: "50%", transform: "translateY(-50%)", height: "30%" }}
          />

          <div className="relative flex flex-col gap-0">
            <div className="py-3 flex items-center justify-center opacity-40">
              <span className="text-white text-lg font-medium truncate px-4 text-center">
                {prevName}
              </span>
            </div>

            <div className="h-px bg-white/20 mx-8" />

            <div className="py-5 flex items-center justify-center">
              <motion.span
                key={currName}
                initial={
                  isAnimating ? { opacity: 0.7, y: -8 } : { opacity: 1, y: 0 }
                }
                animate={{ opacity: 1, y: 0 }}
                className="text-yellow-300 font-bold truncate px-4 text-center"
                style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)" }}
              >
                {currName || "—"}
              </motion.span>
            </div>

            <div className="h-px bg-white/20 mx-8" />

            <div className="py-3 flex items-center justify-center opacity-40">
              <span className="text-white text-lg font-medium truncate px-4 text-center">
                {nextName}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-2xl select-none">
          ❮
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-2xl select-none">
          ❯
        </div>
      </div>

      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex gap-1.5 items-center"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-yellow-400"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
