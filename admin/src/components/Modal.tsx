import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({ open, onClose, title, children, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  const widths: Record<string, string> = {
    sm: "max-w-sm", md: "max-w-lg", lg: "max-w-xl", xl: "max-w-4xl", full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size] || "max-w-lg"} rounded-xl animate-scale-in shadow-elevation-3`}
        style={{ background: "var(--mp-bg-elevated)", border: "1px solid var(--mp-border)" }}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--mp-border-subtle)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--mp-text-primary)" }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--mp-bg-hover)] transition-all" style={{ color: "var(--mp-text-tertiary)" }} type="button">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
