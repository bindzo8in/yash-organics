"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={containerRef} className="py-10 md:py-24 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[600px] md:min-h-[700px] flex flex-col overflow-hidden rounded-[3rem] md:rounded-[4.5rem] shadow-[0_50px_120px_rgba(0,0,0,0.2)] group"
        >
          {/* Parallax Background with refined overlay */}
          <motion.div style={{ y }} className="absolute inset-0 z-0 h-[130%]">
            <Image
              src="/images/organic_hero_background.png"
              alt="Natural Philosophy"
              fill
              className="object-cover"
              priority
            />
            {/* Elegant multi-layered gradient for depth and readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/60 to-transparent z-[1]" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          </motion.div>
    
          {/* Content Layer - Added padding and removed h-full to prevent clipping */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-20 px-8 sm:px-16 md:px-24 lg:px-32">
            <div className="max-w-3xl space-y-8 md:space-y-12 text-white">
              <div className="space-y-4 md:space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 md:w-16 h-px bg-emerald-400/60" />
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.6em] font-bold text-emerald-400">
                    Sustainable Excellence
                  </span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif leading-[1.1] md:leading-tight drop-shadow-2xl"
                >
                  Pure Ingredients. <br />
                  <span className="italic text-emerald-100">Honest Sourcing.</span>
                </motion.h2 >
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="text-base md:text-xl text-white/80 max-w-xl font-medium leading-relaxed"
              >
                We believe in the power of nature to heal and nourish. Every product is 
                hand-bottled in small batches to ensure the highest potency and purity.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="pt-4 md:pt-8"
              >
                <Link href="/about" className="group relative inline-flex items-center gap-6 bg-white text-emerald-950 px-8 md:px-12 py-5 md:py-6 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all duration-500 shadow-2xl hover:shadow-emerald-900/40">
                  Our Philosophy
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative Corner Accents - Hidden on small mobile to avoid overlap */}
          <div className="absolute -bottom-10 -right-10 z-0 opacity-10 group-hover:opacity-20 transition-all duration-1000 pointer-events-none hidden sm:block">
             <div className="text-white text-[20rem] font-serif italic rotate-12">🌿</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
