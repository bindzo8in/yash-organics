"use client";

import { LeafVector } from "./leaf-vector";
import { usePathname } from "next/navigation";

export function FloatingBackground() {
  const pathname = usePathname();
  
  // We can show different densities based on the page if needed
  // For now, let's keep it consistent
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Top Left Leaf */}
      <LeafVector
        src="/leaf/leaf-1.svg"
        className="absolute -top-12 -left-12 w-64 h-64 opacity-[0.03] rotate-[30deg]"
        animate={{
          y: [0, 20, 0],
          rotate: [30, 35, 30],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mid Right Leaf */}
      <LeafVector
        src="/leaf/leaf-2.svg"
        className="absolute top-1/4 -right-16 w-80 h-80 opacity-[0.02] -rotate-[15deg]"
        animate={{
          y: [0, -30, 0],
          rotate: [-15, -10, -15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Bottom Left Leaf */}
      <LeafVector
        src="/leaf/leaf-3.svg"
        className="absolute bottom-1/4 -left-20 w-96 h-96 opacity-[0.025] rotate-[120deg]"
        animate={{
          x: [0, 25, 0],
          rotate: [120, 110, 120],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Bottom Right Leaf */}
      <LeafVector
        src="/leaf/leaf-4.svg"
        className="absolute -bottom-16 -right-16 w-72 h-72 opacity-[0.03] -rotate-[45deg]"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          rotate: [-45, -50, -45],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Extra floating leaf in the middle background */}
      <LeafVector
        src="/leaf/leaf.svg"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-[0.01] pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
