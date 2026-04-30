import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import SlotMachine from "@/components/spin/SlotMachine";
import SpinHistory from "@/components/spin/SpinHistory";
import WinnerPopup from "@/components/spin/WinnerPopup";
import ResultToast from "@/components/spin/ResultToast";

export default function SpinPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [showResultToast, setShowResultToast] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [lastSpinCount, setLastSpinCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: settingsArr = [] } = useQuery({
    queryKey: ["spinSettings"],
    queryFn: () => base44.entities.SpinSettings.list(),
  });

  const settings = settingsArr[0] || {
    spin_duration: 5,
    remove_after_win: false,
    prize_text: "🎉 ได้รับรางวัลพิเศษ!",
  };

  const updateCustomer = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const createResult = useMutation({
    mutationFn: (data) => base44.entities.SpinResult.create(data),
  });

  const activeCustomers = customers.filter((c) => c.is_active !== false);

  const handleSpin = () => {
    if (isSpinning || activeCustomers.length === 0) return;
    const randomIdx = Math.floor(Math.random() * activeCustomers.length);
    setWinnerIndex(randomIdx);
    setIsSpinning(true);
  };

  const handleSpinEnd = async () => {
    setIsSpinning(false);
    const winner = activeCustomers[winnerIndex];
    if (!winner) return;

    const newSpinCount = (winner.spin_count || 0) + 1;
    const isWinner = newSpinCount >= 2;

    // Update in DB
    await updateCustomer.mutateAsync({
      id: winner.id,
      data: {
        spin_count: newSpinCount,
        is_winner: isWinner,
        ...(isWinner && settings.remove_after_win ? { is_active: false } : {}),
      },
    });

    await createResult.mutateAsync({
      customer_name: winner.name,
      customer_id: winner.id,
      round_number: newSpinCount,
      is_winning_spin: isWinner,
    });

    // Save for display
    setSelectedCustomer({
      ...winner,
      spin_count: newSpinCount,
      is_winner: isWinner,
    });
    setLastSpinCount(newSpinCount);

    // Show 2-sec result toast first
    setShowResultToast(true);

    // If winner, show big popup after toast closes (2s)
    if (isWinner) {
      setTimeout(() => setShowWinnerPopup(true), 2200);
    }
  };

  const handleReset = async () => {
    if (isSpinning) return;
    // Batch in chunks of 5 to avoid rate limit
    const chunkSize = 5;
    for (let i = 0; i < customers.length; i += chunkSize) {
      const chunk = customers.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((c) =>
          base44.entities.Customer.update(c.id, {
            spin_count: 0,
            is_winner: false,
            is_active: true,
          }),
        ),
      );
    }
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setSelectedCustomer(null);
  };

  const hasHistory = customers.some((c) => c.spin_count > 0);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 relative flex flex-col">
      {/* BG deco */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 shrink-0">
        {/* DN CENTER logo — white text */}
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

      {/* Body */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-4 md:px-6 pb-4 overflow-hidden">
        {/* Wheel + controls */}
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
                duration={settings.spin_duration || 5}
                winnerIndex={winnerIndex}
              />
            </div>
          )}

          {/* Buttons */}
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

        {/* History panel */}
        {hasHistory && (
          <div className="lg:w-[420px] xl:w-[500px] w-full lg:flex-none overflow-hidden">
            <SpinHistory customers={customers} />
          </div>
        )}
      </main>

      {/* Toast — shows result after each spin */}
      <ResultToast
        isOpen={showResultToast}
        customerName={selectedCustomer?.name}
        spinCount={lastSpinCount}
        onClose={() => setShowResultToast(false)}
      />

      {/* Winner Popup — only when 2nd round */}
      <WinnerPopup
        isOpen={showWinnerPopup}
        onClose={() => setShowWinnerPopup(false)}
        customerName={selectedCustomer?.name}
        prizeText={settings.prize_text}
        prizeImageUrl={settings.prize_image_url}
      />
    </div>
  );
}
