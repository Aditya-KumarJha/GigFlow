import React from "react";
import { motion } from "framer-motion";

const DURATION = 0.25;
const STAGGER = 0.025;

const FlipText = ({ children, className = "" }) => {
  // Split by character but preserve spaces as non-breaking spaces
  const chars = Array.from(children).map((l) => (l === " " ? "\u00A0" : l));
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={`relative inline-block overflow-hidden whitespace-pre ${className}`}
      style={{ lineHeight: 0.75 }}
    >
      {/* Top text */}
      <span>
        {chars.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
          >
            {l}
          </motion.span>
        ))}
      </span>
      {/* Bottom text */}
      <span className="absolute inset-0">
        {chars.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
          >
            {l}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
};

export default FlipText;