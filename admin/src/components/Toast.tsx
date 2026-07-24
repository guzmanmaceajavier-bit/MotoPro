import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

interface Toast { id: number; type: "success" | "error" | "info" | "warning"; message: string; }
interface ToastContextType { showToast: (type: Toast["type"], message: string) => void; }

const ToastContext = createContext<ToastContextType>({} as ToastContextType);
export const useToast = () => useContext(ToastContext);

const icons = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const colors = { success: "#059669", error: "#DC2626", info: "#2563EB", warning: "#D97706" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: Toast["type"], message: string) => {
    setToasts((prev) => [...prev, { id: Date.now(), type, message }]);
  };

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = icons[toast.type];
  const color = colors[toast.type];

  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-sm pointer-events-auto animate-fade-in"
      style={{ background: "var(--bg-card)", border: `1px solid var(--border)`, borderLeft: `3px solid ${color}` }}
    >
      <div style={{ color }}><Icon size={16} /></div>
      <p className="text-sm flex-1" style={{ color: "var(--text)" }}>{toast.message}</p>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-[var(--bg-muted)] transition-all" style={{ color: "var(--text-tertiary)" }} type="button">
        <X size={13} />
      </button>
    </div>
  );
}
