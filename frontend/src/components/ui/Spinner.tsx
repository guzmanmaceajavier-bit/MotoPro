interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

export function Spinner({ size = "md", className = "", label }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`${sizeStyles[size]} animate-spin rounded-full border-interactive-accent border-t-transparent`} />
      {label && <p className="text-sm text-text-tertiary">{label}</p>}
    </div>
  );
}

export function InlineSpinner({ className = "" }: { className?: string }) {
  return <Spinner size="sm" className={`inline-flex ${className}`} />;
}

export function PageSpinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-primary">
      <Spinner size="lg" label={label} />
    </div>
  );
}
