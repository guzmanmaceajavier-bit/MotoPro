import { motion } from "framer-motion";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  highlight?: string[];
  highlightColor?: string;
}

export function TextReveal({
  text, as: Tag = "p", className = "", delay = 0, stagger = 0.06, once = true,
  highlight = [], highlightColor = "from-interactive-accent to-orange-400",
}: TextRevealProps) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once }}
          transition={{ delay: delay + i * stagger, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.3em]"
        >
          {highlight.includes(word) ? (
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${highlightColor}`}>
              {word}
            </span>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </Tag>
  );
}
