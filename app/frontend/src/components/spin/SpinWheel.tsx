import { useRef, useState, useEffect } from "react";
import type { Customer } from "@/types/supabase";

const WHEEL_COLORS = [
  "#6d28d9",
  "#7c3aed",
  "#5b21b6",
  "#8b5cf6",
  "#4c1d95",
  "#a855f7",
  "#3b0764",
  "#9333ea",
  "#581c87",
  "#c084fc",
  "#6d28d9",
  "#a78bfa",
];

interface SpinWheelProps {
  customers: Customer[];
  isSpinning: boolean;
  onSpinEnd: () => void;
  duration?: number;
  winnerIndex: number | null;
}

export default function SpinWheel({
  customers,
  isSpinning,
  onSpinEnd,
  duration = 5,
  winnerIndex,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number | null>(null);

  const segmentAngle = customers.length > 0 ? 360 / customers.length : 360;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || customers.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;

    ctx.clearRect(0, 0, size, size);

    customers.forEach((customer, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (segmentAngle >= 3) {
        const textAngle = startAngle + (endAngle - startAngle) / 2;
        const textRadius = radius * 0.67;
        const textX = center + Math.cos(textAngle) * textRadius;
        const textY = center + Math.sin(textAngle) * textRadius;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);

        let fontSize = 13;
        if (customers.length > 60) fontSize = 6;
        else if (customers.length > 40) fontSize = 7;
        else if (customers.length > 25) fontSize = 8;
        else if (customers.length > 15) fontSize = 10;

        ctx.font = `bold ${fontSize}px Prompt, sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const maxLen =
          customers.length > 40 ? 6 : customers.length > 20 ? 8 : 12;
        const name =
          customer.name.length > maxLen
            ? customer.name.substring(0, maxLen - 1) + "…"
            : customer.name;
        ctx.fillText(name, 0, 0);
        ctx.restore();
      }
    });

    ctx.beginPath();
    ctx.arc(center, center, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = "bold 13px Prompt, sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DN", center, center);
  }, [customers, segmentAngle]);

  useEffect(() => {
    if (!isSpinning || winnerIndex === null || winnerIndex === undefined)
      return;

    const totalRotation = 360 * (5 + Math.floor(Math.random() * 5));
    const winnerAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const finalRotation = totalRotation + (360 - winnerAngle);
    const durationMs = duration * 1000;
    const startTime = Date.now();
    const startRot = rotation;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutCubic(progress);
      const currentRot = startRot + finalRotation * easedProgress;
      setRotation(currentRot);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        if (onSpinEnd) onSpinEnd();
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSpinning, winnerIndex]);

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute rounded-full bg-purple-500/20 blur-2xl"
        style={{ width: "110%", height: "110%" }}
      />

      <div className="absolute -top-3 z-20 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
      </div>

      <div
        className="relative rounded-full border-4 border-yellow-400/70 shadow-2xl"
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full rounded-full"
        />
      </div>
    </div>
  );
}
