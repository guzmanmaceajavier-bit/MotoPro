import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "interactive" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  as?: "div" | "section" | "article";
  animate?: boolean;
  delay?: number;
}

const variantStyles = {
  default: "bg-surface-secondary border border-border rounded-2xl",
  elevated: "bg-surface-secondary border border-border rounded-2xl shadow-elevation-2",
  interactive: "bg-surface-secondary border border-border rounded-2xl hover:border-border-accent hover:shadow-lg hover:shadow-interactive-accent/5 transition-all",
  bordered: "bg-transparent border border-border rounded-2xl",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, variant = "default", padding = "md", className = "", as: Tag = "div", animate = false, delay = 0 }: CardProps) {
  const base = `${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className={base}
      >
        {children}
      </motion.div>
    );
  }
  return <Tag className={base}>{children}</Tag>;
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-sm font-bold text-text-primary ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-border ${className}`}>{children}</div>;
}
