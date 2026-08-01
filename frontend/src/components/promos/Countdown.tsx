import { useState, useEffect, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

export function useCountdown(endsAt?: string) {
  const calc = useCallback(() => {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }, [endsAt]);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    if (!endsAt) return;
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt, calc]);
  return left;
}

export function Countdown({ endsAt, light }: { endsAt: string; light?: boolean }) {
  const left = useCountdown(endsAt);
  if (!left || left.expired) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${light ? "text-amber-300" : "text-text-tertiary"}`}>
        <AlertTriangle size={13} /> Promoción finalizada
      </span>
    );
  }
  const cells = [
    { v: left.d, l: "días" },
    { v: left.h, l: "hrs" },
    { v: left.m, l: "min" },
    { v: left.s, l: "seg" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-1.5">
          <div className={`rounded-lg px-2 py-1 text-center min-w-[44px] ${light ? "bg-white/15 backdrop-blur-sm" : "bg-surface-primary/60 border border-border"}`}>
            <span className={`block text-base font-bold tabular-nums leading-none ${light ? "text-white" : "text-text-primary"}`}>
              {String(c.v).padStart(2, "0")}
            </span>
            <span className={`block text-[10px] uppercase tracking-wider mt-0.5 ${light ? "text-white/70" : "text-text-tertiary"}`}>{c.l}</span>
          </div>
          {i < cells.length - 1 && <span className={`text-sm font-bold ${light ? "text-white/60" : "text-text-tertiary"}`}>:</span>}
        </div>
      ))}
    </div>
  );
}

export const formatPrice = (v: number) => `$${Math.round(v || 0).toLocaleString("es-CO")}`;
