import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCustomers, useUpdateCustomer } from "@/hooks/useCustomers";
import { useSpinSettings } from "@/hooks/useSpinSettings";
import { useCreateSpinResult } from "@/hooks/useSpinResults";
import { usePrizes, useResetPrize } from "@/hooks/usePrizes";
import { useUpsertPrizeSpin, useDeletePrizeSpins } from "@/hooks/useCustomerPrizeSpins";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Customer, Prize } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Settings } from "lucide-react";
import SlotMachine from "@/components/spin/SlotMachine";
import SpinHistory from "@/components/spin/SpinHistory";
import WinnerPopup from "@/components/spin/WinnerPopup";
import ResultToast from "@/components/spin/ResultToast";

const isWin = (newSpinCount: number, winsRequired: number): boolean =>
  newSpinCount > 0 && newSpinCount % winsRequired === 0;

const WINNER_POPUP_DELAY = 1000;

function usePrizeById(prizeId: string | null) {
  return useQuery({
    queryKey: ["prize", prizeId],
    enabled: !!prizeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .eq("id", prizeId as string)
        .maybeSingle();
      if (error) throw error;
      return data as Prize | null;
    },
  });
}

export default function SpinPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [showResultToast, setShowResultToast] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [lastSpinCount, setLastSpinCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const prizeParam = searchParams.get("prize");

  const { data: customers = [] } = useCustomers();
  const { data: settings } = useSpinSettings();
  const { data: prizes = [] } = usePrizes();
  const { data: prizeById } = usePrizeById(prizeParam);

  const activePrize = prizeById ?? null;

  const updateCustomer = useUpdateCustomer();
  const createResult = useCreateSpinResult();
  const resetPrize = useResetPrize();
  const deletePrizeSpins = useDeletePrizeSpins();
  const upsertPrizeSpin = useUpsertPrizeSpin();
  const queryClient = useQueryClient();

  const winsRequired = activePrize?.wins_required ?? 1;
  const removeAfterWin = activePrize?.remove_after_win ?? false;

  const effectiveSettings = settings ?? {
    spin_duration: 5,
    prize_text: "🎉 ได้รับรางวัลพิเศษ!",
    prize_image_url: null,
  };

  const prizeWon = activePrize?.is_won ?? false;

  const excludedFromSingleWin = useMemo(
    () =>
      new Set(
        prizes
          .filter((p) => p.wins_required === 1 && p.is_won && p.winner_customer_id)
          .map((p) => p.winner_customer_id!)
      ),
    [prizes]
  );

  const activeCustomers = customers.filter(
    (c) =>
      c.is_active !== false &&
      !(winsRequired === 1 && excludedFromSingleWin.has(c.id))
  );

  const handlePrizeSelect = (id: string) => {
    setSearchParams(id ? { prize: id } : {});
  };

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

    let newSpinCount = 1;

    try {
      if (activePrize) {
        newSpinCount = await upsertPrizeSpin.mutateAsync({
          customer_id: winner.id,
          prize_id: activePrize.id,
        });
      }

      const winner_ = isWin(newSpinCount, winsRequired);

      await updateCustomer.mutateAsync({
        id: winner.id,
        data: {
          is_winner: winner_,
          ...(winner_ && removeAfterWin ? { is_active: false } : {}),
        },
      });

      await createResult.mutateAsync({
        customer_id: winner.id,
        prize_id: activePrize?.id ?? null,
        outcome: winner_ ? "win" : "no_win",
      });

      if (winner_ && activePrize) {
        await supabase
          .from("prizes")
          .update({ is_won: true, winner_customer_id: winner.id })
          .eq("id", activePrize.id);
        queryClient.invalidateQueries({ queryKey: ["prize", activePrize.id] });
        queryClient.invalidateQueries({ queryKey: ["prizes"] });
      }

      setSelectedCustomer({ ...winner, is_winner: winner_ });
      setLastSpinCount(newSpinCount);
      setShowResultToast(true);

      if (winner_) {
        setTimeout(() => setShowWinnerPopup(true), WINNER_POPUP_DELAY);
      }
    } catch {
      // silently continue — UI update may still be shown
    }
  };

  const handleReset = async () => {
    if (isSpinning || !activePrize) return;
    const winnerId = activePrize.winner_customer_id;
    await Promise.all([
      resetPrize.mutateAsync(activePrize.id),
      deletePrizeSpins.mutateAsync(activePrize.id),
    ]);
    if (winnerId) {
      await updateCustomer.mutateAsync({
        id: winnerId,
        data: { is_winner: false, is_active: true },
      });
    }
    setSelectedCustomer(null);
  };

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

          <select
            value={activePrize?.id ?? ""}
            onChange={(e) => handlePrizeSelect(e.target.value)}
            className="hidden sm:block w-44 h-8 rounded-md bg-white/10 border border-white/20 text-white text-sm px-2 focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            <option value="" disabled className="bg-purple-950">
              เลือกรางวัล
            </option>
            {prizes.map((p) => (
              <option key={p.id} value={p.id} className="bg-purple-950">
                {p.is_won ? `✓ ${p.name}` : p.name}
              </option>
            ))}
          </select>

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

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-3">
              <Button
                onClick={handleSpin}
                disabled={isSpinning || activeCustomers.length === 0 || prizeWon}
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
            <p className="text-white/50 text-sm">
              ผู้ร่วมสนุก {activeCustomers.length} คน
            </p>
          </div>
        </div>

        <div className="lg:w-[420px] xl:w-[500px] w-full lg:flex-none overflow-hidden">
          <SpinHistory prizeId={activePrize?.id ?? null} winsRequired={winsRequired} customers={customers} />
        </div>
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
        prizeName={activePrize?.name}
        prizeText={activePrize?.description ?? effectiveSettings.prize_text}
        prizeImageUrl={activePrize?.image_url ?? effectiveSettings.prize_image_url}
      />
    </div>
  );
}
