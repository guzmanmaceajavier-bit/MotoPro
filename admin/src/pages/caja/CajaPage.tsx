import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@shared/components/ui/Badge";
import { Pagination } from "@shared/components/ui/Pagination";
import KpiCard from "@shared/components/ui/KpiCard";
import {
  Wallet, Lock, Unlock, Plus, Search, Eye, DollarSign, TrendingUp, TrendingDown,
  Clock, Calculator, ArrowDownCircle, ArrowUpCircle, Receipt, X, CheckCircle2, AlertTriangle
} from "lucide-react";

interface CashRegister {
  id: string; opening_amount: number; closing_amount: number;
  total_income: number; total_expenses: number; expected_balance: number;
  actual_balance: number; difference: number; status: string;
  opened_by: string; closed_by: string; opened_at: string; closed_at: string;
  notes: string; transactions: CashTransaction[]; summary: any;
  by_payment_method: any[]; by_category: any[];
}

interface CashTransaction {
  id: string; type: string; category: string; amount: number;
  description: string; payment_method: string; customer_name: string;
  created_by: string; created_at: string;
}

const incomeCategories = [
  { value: "venta_taller", label: "Venta Taller" },
  { value: "venta_tienda", label: "Venta Tienda" },
  { value: "venta_directa", label: "Venta Directa (POS)" },
  { value: "servicio", label: "Servicio" },
  { value: "otro_ingreso", label: "Otro Ingreso" },
];

const expenseCategories = [
  { value: "compra_inventario", label: "Compra Inventario" },
  { value: "servicio_proveedor", label: "Servicio Proveedor" },
  { value: "nómina", label: "Nómina" },
  { value: "arrendamiento", label: "Arrendamiento" },
  { value: "servicios", label: "Servicios (luz, agua, etc.)" },
  { value: "herramientas", label: "Herramientas" },
  { value: "otro_gasto", label: "Otro Gasto" },
];

const paymentMethods = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
];

export default function CajaPage() {
  const { showToast } = useToast();
  const [register, setRegister] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({ total: 0, totalPages: 0 });
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showArqueoModal, setShowArqueoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<CashRegister | null>(null);

  // Forms
  const [openAmount, setOpenAmount] = useState("0");
  const [openNotes, setOpenNotes] = useState("");
  const [closeAmount, setCloseAmount] = useState("0");
  const [closeNotes, setCloseNotes] = useState("");
  const [txForm, setTxForm] = useState({
    type: "income", category: "venta_directa", amount: "", description: "",
    payment_method: "cash", customer_name: ""
  });
  const [arqueoCounts, setArqueoCounts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const denominations = [
    { label: "$100,000", value: 100000 }, { label: "$50,000", value: 50000 },
    { label: "$20,000", value: 20000 }, { label: "$10,000", value: 10000 },
    { label: "$5,000", value: 5000 }, { label: "$2,000", value: 2000 },
    { label: "$1,000", value: 1000 }, { label: "$500", value: 500 },
    { label: "$200", value: 200 }, { label: "$100", value: 100 },
    { label: "$50", value: 50 }, { label: "$20", value: 20 },
    { label: "$10", value: 10 }, { label: "$5", value: 5 },
    { label: "$1", value: 1 },
  ];

  const loadRegister = useCallback(async () => {
    try {
      const res = await api.get("/cash-register");
      setRegister(res);
    } catch { setRegister(null); }
    finally { setLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get(`/cash-register/history?page=${historyPage}&limit=10`);
      if (res?.data) { setHistory(res.data); setHistoryPagination(res.pagination); }
      else setHistory(Array.isArray(res) ? res : []);
    } catch { setHistory([]); }
  }, [historyPage]);

  useEffect(() => { loadRegister(); }, [loadRegister]);
  useEffect(() => { if (activeTab === "history") loadHistory(); }, [activeTab, loadHistory]);

  const openCashRegister = async () => {
    setSaving(true);
    try {
      await api.post("/cash-register", { opening_amount: parseFloat(openAmount) || 0, notes: openNotes });
      showToast("success", "Caja abierta");
      setShowOpenModal(false);
      loadRegister();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const closeCashRegister = async () => {
    if (!register) return;
    setSaving(true);
    try {
      const res = await api.post(`/cash-register/${register.id}/close`, {
        actual_balance: parseFloat(closeAmount) || 0,
        notes: closeNotes,
        denomination_counts: arqueoCounts
      });
      if (res?.difference !== undefined && Math.abs(res.difference) > 0.01) {
        showToast("warning", `Diferencia: $${res.difference.toFixed(2)}`);
      } else {
        showToast("success", "Caja cerrada correctamente");
      }
      setShowCloseModal(false);
      loadRegister();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const addTransaction = async () => {
    if (!register) return;
    if (!txForm.amount || parseFloat(txForm.amount) <= 0) { showToast("error", "Monto requerido"); return; }
    setSaving(true);
    try {
      await api.post("/cash-transactions", {
        cash_register_id: register.id,
        type: txForm.type,
        category: txForm.category,
        amount: parseFloat(txForm.amount),
        description: txForm.description,
        payment_method: txForm.payment_method,
        customer_name: txForm.customer_name
      });
      showToast("success", txForm.type === "income" ? "Ingreso registrado" : "Gasto registrado");
      setShowTransactionModal(false);
      setTxForm({ type: "income", category: "venta_directa", amount: "", description: "", payment_method: "cash", customer_name: "" });
      loadRegister();
    } catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const calculateArqueo = () => {
    let total = 0;
    Object.entries(arqueoCounts).forEach(([denom, count]) => {
      total += parseInt(denom) * (count || 0);
    });
    return total;
  };

  if (loading) return <div className="space-y-4 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--mp-bg-elevated)] rounded-xl" />)}</div>;

  const isOpen = !!register;
  const summary = register?.summary || { total_income: 0, total_expenses: 0, balance: register?.opening_amount || 0, transaction_count: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Caja"
        description="Gestión de apertura, cierre y movimientos de caja"
        breadcrumbs={[{ label: "Finanzas" }, { label: "Caja" }]}
        icon={<Wallet size={20} />}
        action={
          <div className="flex items-center gap-2">
            {!isOpen ? (
              <button onClick={() => { setOpenAmount("0"); setOpenNotes(""); setShowOpenModal(true); }} className="mp-btn-primary text-xs">
                <Unlock size={14} /> Abrir Caja
              </button>
            ) : (
              <>
                <button onClick={() => { setShowTransactionModal(true); }} className="mp-btn-secondary text-xs">
                  <Plus size={14} /> Movimiento
                </button>
                <button onClick={() => { setCloseAmount("0"); setCloseNotes(""); setShowArqueoModal(true); }} className="mp-btn-primary text-xs bg-amber-600 hover:bg-amber-700">
                  <Calculator size={14} /> Arqueo
                </button>
                <button onClick={() => { setCloseAmount(String(summary.balance)); setShowCloseModal(true); }} className="mp-btn-primary text-xs bg-red-600 hover:bg-red-700">
                  <Lock size={14} /> Cerrar Caja
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border ${isOpen ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center gap-3">
          {isOpen ? <Unlock size={20} className="text-emerald-600" /> : <Lock size={20} className="text-gray-400" />}
          <div>
            <p className={`text-sm font-semibold ${isOpen ? "text-emerald-800" : "text-gray-600"}`}>
              {isOpen ? "Caja Abierta" : "Caja Cerrada"}
            </p>
            {isOpen && (
              <p className="text-xs text-emerald-600">
                Abierta por {register?.opened_by} el {new Date(register?.opened_at || "").toLocaleString("es-CO")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Apertura" value={`$${(register?.opening_amount || 0).toLocaleString()}`} icon={<Wallet size={18} />} iconColor="blue" />
        <KpiCard title="Ingresos" value={`$${summary.total_income.toLocaleString()}`} icon={<TrendingUp size={18} />} iconColor="green" />
        <KpiCard title="Gastos" value={`$${summary.total_expenses.toLocaleString()}`} icon={<TrendingDown size={18} />} iconColor="red" />
        <KpiCard title="Balance" value={`$${summary.balance.toLocaleString()}`} icon={<DollarSign size={18} />} iconColor="teal" />
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--mp-border)]">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab("current")} className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${activeTab === "current" ? "border-[var(--mp-accent)] text-[var(--mp-accent)]" : "border-transparent text-[var(--mp-text-tertiary)]"}`}>
            Movimientos Actuales
          </button>
          <button onClick={() => setActiveTab("history")} className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${activeTab === "history" ? "border-[var(--mp-accent)] text-[var(--mp-accent)]" : "border-transparent text-[var(--mp-text-tertiary)]"}`}>
            Historial de Cierres
          </button>
        </div>
      </div>

      {/* Current Transactions */}
      {activeTab === "current" && (
        <div className="mp-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--mp-border)]">
                <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Tipo</th>
                <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Categoría</th>
                <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden md:table-cell">Descripción</th>
                <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden lg:table-cell">Método</th>
                <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Monto</th>
                <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase hidden xl:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {register?.transactions?.map(tx => (
                <tr key={tx.id} className="border-b border-[var(--mp-border-subtle)] hover:bg-[var(--mp-bg-elevated)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {tx.type === "income" ? <ArrowDownCircle size={14} className="text-emerald-500" /> : <ArrowUpCircle size={14} className="text-red-500" />}
                      <Badge variant={tx.type === "income" ? "success" : "danger"}>{tx.type === "income" ? "Ingreso" : "Gasto"}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{tx.category}</td>
                  <td className="px-4 py-3 text-sm text-[var(--mp-text-secondary)] hidden md:table-cell">{tx.description || "—"}</td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">{tx.payment_method}</td>
                  <td className={`px-4 py-3 text-right font-bold ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--mp-text-tertiary)] hidden xl:table-cell">{new Date(tx.created_at).toLocaleString("es-CO")}</td>
                </tr>
              ))}
              {(!register?.transactions || register.transactions.length === 0) && (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--mp-text-tertiary)]">No hay movimientos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="mp-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--mp-border)]">
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Fecha Apertura</th>
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Apertura</th>
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Ingresos</th>
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Gastos</th>
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Esperado</th>
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Real</th>
                  <th className="text-left text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Diferencia</th>
                  <th className="text-right text-xs font-medium text-[var(--mp-text-tertiary)] px-4 py-3 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-b border-[var(--mp-border-subtle)] hover:bg-[var(--mp-bg-elevated)]">
                    <td className="px-4 py-3 text-sm">{new Date(h.opened_at).toLocaleString("es-CO")}</td>
                    <td className="px-4 py-3 text-sm font-medium">${h.opening_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600">${h.total_income.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-red-600">${h.total_expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">${h.expected_balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium">${(h.actual_balance || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${h.difference === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {h.difference > 0 ? "+" : ""}{h.difference.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setShowDetailModal(h)} className="mp-btn-ghost text-xs py-1.5 px-2"><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-[var(--mp-text-tertiary)]">No hay historial</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Pagination page={historyPage} perPage={10} total={historyPagination.total} onChange={setHistoryPage} />
          </div>
        </div>
      )}

      {/* Open Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowOpenModal(false)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-sm mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">Abrir Caja</h3>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Monto de apertura *</label>
              <input type="number" value={openAmount} onChange={e => setOpenAmount(e.target.value)}
                className="mp-input text-lg font-bold" placeholder="0" min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Notas</label>
              <input value={openNotes} onChange={e => setOpenNotes(e.target.value)} className="mp-input" placeholder="Notas opcionales" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowOpenModal(false)} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
              <button onClick={openCashRegister} disabled={saving} className="mp-btn-primary flex-1 text-xs">
                {saving ? "Abriendo..." : "Abrir Caja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCloseModal(false)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-sm mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">Cerrar Caja</h3>
            <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)] text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Balance esperado:</span><span className="font-bold">${summary.balance.toLocaleString()}</span></div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Monto físico (conteo) *</label>
              <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)}
                className="mp-input text-lg font-bold" min="0" />
            </div>
            {parseFloat(closeAmount) > 0 && parseFloat(closeAmount) !== summary.balance && (
              <div className={`p-3 rounded-lg text-sm ${parseFloat(closeAmount) > summary.balance ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                Diferencia: <b>{parseFloat(closeAmount) > summary.balance ? "+" : ""}{(parseFloat(closeAmount) - summary.balance).toFixed(2)}</b>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Notas</label>
              <input value={closeNotes} onChange={e => setCloseNotes(e.target.value)} className="mp-input" placeholder="Notas" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCloseModal(false)} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
              <button onClick={closeCashRegister} disabled={saving} className="mp-btn-primary flex-1 text-xs bg-red-600 hover:bg-red-700">
                {saving ? "Cerrando..." : "Cerrar Caja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTransactionModal(false)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">Nuevo Movimiento</h3>
            <div className="flex gap-2">
              <button onClick={() => setTxForm(p => ({ ...p, type: "income" }))}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${txForm.type === "income" ? "bg-emerald-500 text-white border-emerald-500" : "border-[var(--mp-border)]"}`}>
                <TrendingUp size={14} className="inline mr-1" /> Ingreso
              </button>
              <button onClick={() => setTxForm(p => ({ ...p, type: "expense", category: "compra_inventario" }))}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${txForm.type === "expense" ? "bg-red-500 text-white border-red-500" : "border-[var(--mp-border)]"}`}>
                <TrendingDown size={14} className="inline mr-1" /> Gasto
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Categoría</label>
                <select value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))} className="mp-input text-xs">
                  {(txForm.type === "income" ? incomeCategories : expenseCategories).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Método de pago</label>
                <select value={txForm.payment_method} onChange={e => setTxForm(p => ({ ...p, payment_method: e.target.value }))} className="mp-input text-xs">
                  {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Monto *</label>
              <input type="number" value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))}
                className="mp-input text-lg font-bold" placeholder="0" min="1" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-secondary)] mb-1 block">Descripción</label>
              <input value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))}
                className="mp-input" placeholder="Descripción del movimiento" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowTransactionModal(false)} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
              <button onClick={addTransaction} disabled={saving} className="mp-btn-primary flex-1 text-xs">
                {saving ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Arqueo Modal */}
      {showArqueoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowArqueoModal(false)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">Arqueo de Caja</h3>
            <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)] text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Balance del sistema:</span><span className="font-bold">${summary.balance.toLocaleString()}</span></div>
            </div>
            <p className="text-xs text-[var(--mp-text-secondary)]">Conteo de billetes y monedas:</p>
            <div className="grid grid-cols-2 gap-2">
              {denominations.map(d => (
                <div key={d.value} className="flex items-center gap-2">
                  <span className="text-xs w-20 text-[var(--mp-text-secondary)]">{d.label}</span>
                  <input type="number" min="0" value={arqueoCounts[d.value] || ""}
                    onChange={e => setArqueoCounts(p => ({ ...p, [d.value]: parseInt(e.target.value) || 0 }))}
                    className="mp-input text-xs flex-1" placeholder="0" />
                  <span className="text-xs text-[var(--mp-text-tertiary)] w-16 text-right">
                    ${((arqueoCounts[d.value] || 0) * d.value).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-[var(--mp-bg-elevated)] text-sm space-y-1 border-t border-[var(--mp-border-subtle)]">
              <div className="flex justify-between"><span className="text-[var(--mp-text-tertiary)]">Contado:</span><span className="font-bold">${calculateArqueo().toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span className="text-[var(--mp-text-tertiary)]">Diferencia:</span>
                <span className={`font-bold ${calculateArqueo() - summary.balance === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {calculateArqueo() > 0 ? `${calculateArqueo() - summary.balance > 0 ? "+" : ""}${(calculateArqueo() - summary.balance).toLocaleString()}` : "—"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowArqueoModal(false)} className="mp-btn-ghost flex-1 text-xs">Cancelar</button>
              <button onClick={() => { setCloseAmount(String(calculateArqueo())); setShowArqueoModal(false); setShowCloseModal(true); }}
                className="mp-btn-primary flex-1 text-xs">
                Aplicar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDetailModal(null)}>
          <div className="bg-[var(--mp-bg-primary)] rounded-xl border border-[var(--mp-border)] w-full max-w-lg mx-4 p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--mp-text-primary)]">Detalle de Cierre</h3>
              <button onClick={() => setShowDetailModal(null)} className="text-[var(--mp-text-tertiary)]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Apertura</span><p className="font-medium">${showDetailModal.opening_amount.toLocaleString()}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Cierre</span><p className="font-medium">${(showDetailModal.closing_amount || 0).toLocaleString()}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Ingresos</span><p className="font-medium text-emerald-600">${showDetailModal.total_income.toLocaleString()}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Gastos</span><p className="font-medium text-red-600">${showDetailModal.total_expenses.toLocaleString()}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Esperado</span><p className="font-medium">${showDetailModal.expected_balance.toLocaleString()}</p></div>
              <div><span className="text-[var(--mp-text-tertiary)] text-xs">Diferencia</span>
                <p className={`font-bold ${showDetailModal.difference === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {showDetailModal.difference > 0 ? "+" : ""}{showDetailModal.difference.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2"><span className="text-[var(--mp-text-tertiary)] text-xs">Abierto por</span><p>{showDetailModal.opened_by} — {new Date(showDetailModal.opened_at).toLocaleString("es-CO")}</p></div>
              <div className="col-span-2"><span className="text-[var(--mp-text-tertiary)] text-xs">Cerrado por</span><p>{showDetailModal.closed_by} — {showDetailModal.closed_at ? new Date(showDetailModal.closed_at).toLocaleString("es-CO") : "—"}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
