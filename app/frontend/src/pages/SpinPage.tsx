import { useState } from "react";
import {
  useCustomers,
  useUpdateCustomer,
  useResetAllCustomers,
} from "@/hooks/useCustomers";
import { useSpinSettings } from "@/hooks/useSpinSettings";
import { useCreateSpinResult } from "@/hooks/useSpinResults";
import type { Customer } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import SlotMachine from "@/components/spin/SlotMachine";
import SpinHistory from "@/components/spin/SpinHistory";
import WinnerPopup from "@/components/spin/WinnerPopup";
import ResultToast from "@/components/spin/ResultToast";

const isWin = (newSpinCount: number): boolean =>
  newSpinCount > 0 && newSpinCount % 2 === 0;

export default function SpinPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [showResultToast, setShowResultToast] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [lastSpinCount, setLastSpinCount] = useState(0);

  const { data: customers = [] } = useCustomers();
  const { data: settings } = useSpinSettings();
  const updateCustomer = useUpdateCustomer();
  const createResult = useCreateSpinResult();
  const resetAll = useResetAllCustomers();

  const effectiveSettings = settings ?? {
    spin_duration: 5,
    remove_after_win: false,
    prize_text: "🎉 ได้รับรางวัลพิเศษ!",
    prize_image_url: null,
  };

  const activeCustomers = customers.filter((c) => c.is_active !== false);

  const handleSpin = () => {
    if (isSpinning || activeCustomers.length === 0) return;
    const randomIdx = Math.floor(Math.random() * activeCustomers.length);
    setWinnerIndex(randomIdx);
    setIsSpinning(true);
  };

  const handleSpinEnd = async () => {
    setIsSpinning(false);
    if (winnerIndex === null) return;
    const winner = activeCustomers[winnerIndex];
    if (!winner) return;

    const newSpinCount = (winner.spin_count ?? 0) + 1;
    const winner_ = isWin(newSpinCount);

    try {
      await updateCustomer.mutateAsync({
        id: winner.id,
        data: {
          spin_count: newSpinCount,
          is_winner: winner_,
          ...(winner_ && effectiveSettings.remove_after_win
            ? { is_active: false }
            : {}),
        },
      });

      await createResult.mutateAsync({
        customer_id: winner.id,
        outcome: winner_ ? "win" : "no_win",
      });
    } catch {
      // silently continue — UI update may still be shown
    }

    setSelectedCustomer({
      ...winner,
      spin_count: newSpinCount,
      is_winner: winner_,
    });
    setLastSpinCount(newSpinCount);
    setShowResultToast(true);

    if (winner_) {
      setTimeout(() => setShowWinnerPopup(true), 2200);
    }
  };

  const handleReset = async () => {
    if (isSpinning) return;
    await resetAll.mutateAsync();
    setSelectedCustomer(null);
  };

  const hasHistory = customers.some((c) => c.spin_count > 0);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 relative flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 shrink-0">
        <div className="flex flex-col items-start leading-none">
          <span
            className="text-white font-black tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1 }}
          >
            DN
          </span>
          <span
            className="text-white/80 font-semibold tracking-[0.35em] uppercase"
            style={{ fontSize: "clamp(0.55rem, 1.2vw, 0.9rem)" }}
          >
            CENTER
          </span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-white/90 font-bold text-lg md:text-2xl hidden sm:block">
            วงล้อจับฉลาก
          </h1>
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-1.5" />
              จัดการระบบ
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-4 md:px-6 pb-4 overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-4 flex-1 min-w-0">
          {activeCustomers.length === 0 ? (
            <div className="w-full max-w-md rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center py-20">
              <p className="text-white/50 text-center px-8 text-sm">
                ยังไม่มีรายชื่อ
                <br />
                กรุณาเพิ่มรายชื่อในหน้าจัดการระบบ
              </p>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <SlotMachine
                customers={activeCustomers}
                isSpinning={isSpinning}
                onSpinEnd={handleSpinEnd}
                duration={effectiveSettings.spin_duration ?? 5}
                winnerIndex={winnerIndex}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || activeCustomers.length === 0}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-purple-950 font-bold text-base px-8 py-5 rounded-2xl shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              <Play className="w-5 h-5 mr-2" />
              {isSpinning ? "กำลังสุ่ม..." : "หมุนวงล้อ!"}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isSpinning}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-5 py-5 rounded-2xl"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              รีเซ็ต
            </Button>
          </div>
        </div>

        {hasHistory && (
          <div className="lg:w-[420px] xl:w-[500px] w-full lg:flex-none overflow-hidden">
            <SpinHistory customers={customers} />
          </div>
        )}
      </main>

      <ResultToast
        isOpen={showResultToast}
        customerName={selectedCustomer?.name}
        spinCount={lastSpinCount}
        onClose={() => setShowResultToast(false)}
      />

      <WinnerPopup
        isOpen={showWinnerPopup}
        onClose={() => setShowWinnerPopup(false)}
        customerName={selectedCustomer?.name}
        prizeText={effectiveSettings.prize_text}
        prizeImageUrl={effectiveSettings.prize_image_url}
      />
    </div>
  );
}
