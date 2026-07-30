import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  variant?: "primary" | "secondary";
  spacing?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: "bg-surface-primary",
  secondary: "bg-surface-secondary",
};

const spacingStyles = {
  sm: "py-10",
  md: "py-16",
  lg: "py-20",
};

export function Section({ children, title, subtitle, badge, className = "", variant = "primary", spacing = "lg" }: SectionProps) {
  return (
    <section className={`${variantStyles[variant]} ${spacingStyles[spacing]} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(badge || title) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {badge && (
              <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="inline-block text-[10px] font-bold text-interactive-accent uppercase tracking-[0.2em] mb-3">
                {badge}
              </motion.span>
            )}
            {title && (
              <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-heading font-bold text-text-primary">
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                className="mt-3 text-sm text-text-secondary">
                {subtitle}
              </motion.p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
