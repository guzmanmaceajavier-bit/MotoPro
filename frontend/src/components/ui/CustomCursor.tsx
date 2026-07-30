import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorVariant = "default" | "hover" | "click";

export function CustomCursor() {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });

  const isTouchDevice = useCallback(() => "ontouchstart" in window || navigator.maxTouchPoints > 0, []);

  useEffect(() => {
    if (isTouchDevice()) return;

    setIsVisible(true);

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const down = () => setVariant("click");
    const up = () => setVariant("default");

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches(
        'a, button, input, select, textarea, [data-cursor-hover], label, [role="button"]'
      ) || target.closest('a, button, [data-cursor-hover], [role="button"]');
      setVariant(isInteractive ? "hover" : "default");
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    document.addEventListener("mouseover", handleHover);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("mouseover", handleHover);
    };
  }, [cursorX, cursorY, isTouchDevice]);

  if (!isVisible || isTouchDevice()) return null;

  const size = variant === "hover" ? 56 : variant === "click" ? 44 : 24;
  const label = variant === "hover" ? "EXPLORAR" : "";

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={{
          width: size,
          height: size,
          borderRadius: variant === "hover" ? "4px" : "50%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center justify-center"
        style={{ backgroundColor: "var(--interactive-accent)" }}
      >
        {label && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[8px] font-bold tracking-[0.15em] select-none"
            style={{ color: "var(--text-inverse)" }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
