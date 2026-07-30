import { sanitizeHtml } from "@/lib/sanitize";

export default function SectionTitle({ title, subtitle, light }: { title: string; subtitle?: string; light?: boolean }) {
  return (
    <div className="mb-12 text-center">
      <h2
        className="text-3xl md:text-4xl font-heading font-bold tracking-tight"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
        style={{ color: light ? "#FFFFFF" : "var(--color-text, #0F172A)" }}
      />
      {subtitle && (
        <p
          className="mt-3 max-w-2xl mx-auto text-base md:text-lg"
          style={{ color: light ? "rgba(255,255,255,0.6)" : "var(--color-text-secondary, #64748B)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
