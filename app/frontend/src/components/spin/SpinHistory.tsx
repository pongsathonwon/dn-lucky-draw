import { Trophy, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Customer } from "@/types/supabase";

interface SpinHistoryProps {
  readonly customers: Customer[];
}

export default function SpinHistory({ customers }: SpinHistoryProps) {
  const selected = [...customers.filter((c) => c.spin_count > 0)].sort(
    (a, b) => b.spin_count - a.spin_count,
  );

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col h-full">
      <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2 shrink-0">
        <CircleDot className="w-4 h-4 text-yellow-400" />
        ผลการจับฉลาก ({selected.length} ร้าน)
      </h3>
      {selected.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-xs text-center">ยังไม่มีประวัติการจับฉลาก</p>
        </div>
      ) : (
      <div
        className="flex-1 grid content-start"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "4px",
        }}
      >
        <AnimatePresence>
          {selected.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col rounded-lg px-2 py-1.5 border ${
                c.is_winner
                  ? "bg-yellow-500/20 border-yellow-500/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <span
                className="text-white font-medium leading-tight truncate"
                style={{ fontSize: "11px" }}
              >
                {c.name}
              </span>
              <div className="mt-0.5 flex items-center gap-0.5">
                {c.is_winner ? (
                  <>
                    <Trophy className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
                    <span
                      className="text-yellow-300 font-bold"
                      style={{ fontSize: "10px" }}
                    >
                      ชนะ!
                    </span>
                  </>
                ) : (
                  <span
                    className="text-purple-300"
                    style={{ fontSize: "10px" }}
                  >
                    {c.spin_count} รอบ
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
}
