import { Trophy, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Customer } from "@/types/supabase";
import { useCustomerPrizeSpins } from "@/hooks/useCustomerPrizeSpins";

interface SpinHistoryProps {
  readonly prizeId: string | null;
  readonly winsRequired: number;
  readonly customers: Customer[];
}

function cardClass(isWinner: boolean, atThreshold: boolean): string {
  if (isWinner) return "bg-yellow-500/20 border-yellow-500/40";
  if (atThreshold) return "bg-yellow-400/10 border-yellow-400/30";
  return "bg-white/5 border-white/10";
}

export default function SpinHistory({ prizeId, winsRequired, customers }: SpinHistoryProps) {
  const { data: spinRows = [] } = useCustomerPrizeSpins(prizeId);

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const rows = [...spinRows].sort((a, b) => b.spin_count - a.spin_count);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col h-full">
      <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2 shrink-0">
        <CircleDot className="w-4 h-4 text-yellow-400" />
        ผลการจับฉลาก ({rows.length} ร้าน)
      </h3>
      {rows.length === 0 ? (
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
            {rows.map((row) => {
              const customer = customerMap.get(row.customer_id);
              const isWinner = customer?.is_winner ?? false;
              const atThreshold = row.spin_count >= winsRequired;

              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex flex-col rounded-lg px-2 py-1.5 border ${cardClass(isWinner, atThreshold)}`}
                >
                  <span
                    className="text-white font-medium leading-tight truncate"
                    style={{ fontSize: "11px" }}
                  >
                    {customer?.name ?? "—"}
                  </span>
                  <div className="mt-0.5 flex items-center gap-0.5">
                    {isWinner ? (
                      <>
                        <Trophy className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
                        <span className="text-yellow-300 font-bold" style={{ fontSize: "10px" }}>
                          ชนะ!
                        </span>
                      </>
                    ) : (
                      <span
                        className={atThreshold ? "text-yellow-300 font-semibold" : "text-purple-300"}
                        style={{ fontSize: "10px" }}
                      >
                        {row.spin_count} รอบ
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
