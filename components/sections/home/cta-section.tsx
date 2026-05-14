"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LeafVector } from "@/components/shared/leaf-vector";

export function CTASection() {
  return (
    <section className="py-16 px-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="max-w-7xl mx-auto relative overflow-hidden bg-emerald-950 text-white rounded-3xl px-8 py-16 md:py-20 shadow-[0_50px_100px_rgba(6,78,59,0.2)]"
      >
        {/* Decorative Vectors */}
        <LeafVector 
          src="/leaf/leaf.svg"
          className="absolute -top-32 -left-32 w-96 h-96 opacity-10 rotate-180"
          animate={{ rotate: [180, 190, 180] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <LeafVector 
          src="/leaf/leaf-3.svg"
          className="absolute -bottom-32 -right-32 w-96 h-96 opacity-10"
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Artistic Glows */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-800/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-xs uppercase tracking-[0.5em] font-bold text-emerald-400">Join the Ritual</span>
            <h2 className="text-4xl md:text-6xl font-serif leading-tight">
              Start Your <span className="italic text-emerald-100">Organic</span> <br />
              Journey Today.
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Subscribe to our newsletter for exclusive organic wisdom, 
            new product launches, and sustainable living tips.
          </motion.p>
  
          {/* Refined Subscription Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative max-w-xl mx-auto pt-6"
          >
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-10 pr-40 text-sm focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 outline-none backdrop-blur-md transition-all placeholder:text-white/30 hover:bg-white/10"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-white text-emerald-950 px-10 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all shadow-xl">
                Join Now
              </button>
            </div>
            <p className="mt-4 text-[10px] text-white/40 uppercase tracking-widest font-bold">
              No Spam. Just Pure Nature.
            </p>
          </motion.div>
  
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-12 pt-12 border-t border-white/5"
          >
            <Link href="/products" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors flex items-center gap-3 group">
              Explore Products <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/contact" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors flex items-center gap-3 group">
              Get in Touch <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
