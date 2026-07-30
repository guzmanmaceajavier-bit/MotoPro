import { motion } from "framer-motion";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
  warranty?: string;
  quality_label?: string;
  compatibility_text?: string;
  maxQuantity?: number;
}

interface CartItemRowProps {
  item: CartItem;
  onRemove: (id: string | number) => void;
  onDecrement: (id: string | number) => void;
  onUpdateQuantity: (id: string | number, qty: number) => void;
}

export function CartItemRow({ item, onRemove, onDecrement, onUpdateQuantity }: CartItemRowProps) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface-secondary overflow-hidden"
    >
      <div className="p-5">
        <div className="flex gap-5">
          <div className="w-40 h-40 rounded-lg bg-surface-tertiary flex items-center justify-center shrink-0 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{item.name}</h3>
                  {item.brand && <p className="text-sm text-text-secondary mt-0.5">{item.brand}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-text-tertiary">100% Sintético</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                      En stock
                    </span>
                  </div>
                </div>
                <p className="text-xl font-bold text-interactive-accent shrink-0">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              {(item.warranty || "3 meses") && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Garantía</p>
                    <p className="text-[10px] text-text-tertiary">{item.warranty || "3 meses"}</p>
                  </div>
                </div>
              )}
              {(item.quality_label || "Original") && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.014 6.014 0 01-2.27.408m0 0c-.51 0-1.01-.064-1.49-.183M16.27 9.728a6.014 6.014 0 00-2.27-.408m0 0c-1.125 0-2.17-.31-3.08-.85m0 0a6.014 6.014 0 01-1.49-.183" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Calidad</p>
                    <p className="text-[10px] text-text-tertiary">{item.quality_label || "Original"}</p>
                  </div>
                </div>
              )}
              {(item.compatibility_text || "Universal") && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Compatibilidad</p>
                    <p className="text-[10px] text-text-tertiary">{item.compatibility_text || "Universal"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => onDecrement(item.id)} aria-label="Reducir cantidad"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            <input type="number" value={item.quantity}
              onChange={(e) => { const v = Math.max(1, parseInt(e.target.value) || 1); onUpdateQuantity(item.id, item.maxQuantity ? Math.min(v, item.maxQuantity) : v); }}
              className="w-16 text-center bg-surface-tertiary border border-border rounded-lg text-sm font-medium text-text-primary py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar cantidad"
              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-surface-tertiary transition-colors disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <span className="text-sm text-text-tertiary ml-2">
              ${item.price.toLocaleString()} c/u
            </span>
          </div>
          <button onClick={() => onRemove(item.id)}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
