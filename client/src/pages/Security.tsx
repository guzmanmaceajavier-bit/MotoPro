import { Shield, Smartphone, Key } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";

export default function Security() {
  return (
    <div className="space-y-6">
      <h1 className="text-h3 text-text-primary tracking-tight">Seguridad</h1>
      
      <div className="rounded-lg border border-border bg-surface-secondary p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(20,184,166,0.1)] text-interactive-accent">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-body-lg font-semibold text-text-primary">Autenticación en dos pasos (2FA)</h3>
              <p className="text-body-sm text-text-tertiary">Añade una capa extra de seguridad a tu cuenta.</p>
            </div>
          </div>
          <Badge variant="success">Activado</Badge>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-secondary">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-caption font-semibold text-text-primary">Dispositivos activos</h2>
        </div>
        <div className="p-4 space-y-2">
          {[
            { device: "Chrome en Windows 10", location: "Medellín, Colombia", time: "Sesión actual", icon: "monitor" },
            { device: "iPhone 13", location: "Medellín, Colombia", time: "Hace 2 días", icon: "smartphone" },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-sm hover:bg-surface-tertiary transition-colors">
              <div className="flex items-center gap-3">
                {d.icon === "monitor" ? <div className="text-text-tertiary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg></div> : <Smartphone size={20} className="text-text-tertiary" />}
                <div>
                  <p className="text-body-sm font-medium text-text-primary">{d.device}</p>
                  <p className="text-tiny text-text-tertiary">{d.location} • {d.time}</p>
                </div>
              </div>
              <button className="text-tiny text-status-error hover:underline">Cerrar sesión</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
