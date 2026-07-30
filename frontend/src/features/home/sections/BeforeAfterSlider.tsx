import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  before, after,
  beforeLabel = "Antes", afterLabel = "Después",
  className = "",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-lg border border-border ${className}`}
      style={{ aspectRatio: "4/3" }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* After image (right side, full width clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <img src={after} alt={afterLabel} className="w-full h-full object-cover" draggable={false} />
      </div>

      {/* Before image (left side, full width clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={before} alt={beforeLabel} className="w-full h-full object-cover" draggable={false} />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 z-10 text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md select-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 z-10 text-[10px] font-bold text-white bg-interactive-accent/80 backdrop-blur-sm px-2.5 py-1 rounded-md select-none">
        {afterLabel}
      </span>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0 z-20 cursor-ew-resize"
        style={{ left: `${sliderPos}%`, translateX: "-50%" }}
        onPointerDown={onPointerDown}
      >
        {/* Line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" />

        {/* Handle circle */}
        <motion.div
          animate={{ scale: isDragging ? 1.15 : 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-elevation-3 flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
            <path d="M15 18l6-6-6-6" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
