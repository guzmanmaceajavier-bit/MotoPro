import { motion } from "framer-motion";

interface BrandLogoProps {
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: "h-6 w-6", container: "h-6 w-6 text-[10px]", text: "text-xs", gap: "gap-1.5", px: "px-2 py-1" },
  md: { img: "h-10 w-10", container: "h-10 w-10 text-sm", text: "text-sm", gap: "gap-2", px: "px-3 py-1.5" },
  lg: { img: "h-14 w-14", container: "h-14 w-14 text-lg", text: "text-base", gap: "gap-3", px: "px-4 py-2" },
};

const BRAND_COLORS = [
  "from-interactive-accent to-orange-400",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-red-500 to-rose-500",
  "from-teal-500 to-green-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
];

export function BrandLogo({ name, image, size = "md", showName = true, className = "" }: BrandLogoProps) {
  const s = sizeMap[size];
  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % BRAND_COLORS.length;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      className={`inline-flex items-center ${s.gap} ${s.px} rounded-xl border border-border-subtle bg-surface-secondary hover:border-interactive-accent/30 hover:bg-interactive-accent/5 transition-all ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          className={`${s.img} rounded-lg object-contain shrink-0`}
        />
      ) : (
        <div className={`${s.container} flex items-center justify-center rounded-lg bg-gradient-to-br ${BRAND_COLORS[colorIndex]} font-bold text-white shrink-0`}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {showName && <span className={`${s.text} font-semibold text-text-secondary`}>{name}</span>}
    </motion.div>
  );
}

export function BrandPill({ name, image }: { name: string; image?: string }) {
  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % BRAND_COLORS.length;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-surface-secondary shrink-0">
      {image ? (
        <img src={image} alt={name} className="h-5 w-5 rounded object-contain" />
      ) : (
        <div className={`h-5 w-5 rounded flex items-center justify-center bg-gradient-to-br ${BRAND_COLORS[colorIndex]} text-[8px] font-bold text-white`}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-xs font-medium text-text-secondary">{name}</span>
    </div>
  );
}
