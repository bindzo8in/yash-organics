"use client";

import Image from "next/image";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface LeafVectorProps extends HTMLMotionProps<"div"> {
  src: string;
  className?: string;
}

export function LeafVector({ src, className, ...props }: LeafVectorProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none", className)}
      {...props}
    >
      <Image
        src={src}
        alt="Decorative leaf"
        width={400}
        height={400}
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
}
