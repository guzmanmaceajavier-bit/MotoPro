import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function FadeIn({ children, delay = 0, direction }: { children: ReactNode; delay?: number; direction?: string }) {
  const variants = {
    hidden: { opacity: 0, x: direction === "left" ? 20 : direction === "right" ? -20 : 0, y: direction ? 0 : 20 },
    visible: { opacity: 1, x: 0, y: 0 },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
