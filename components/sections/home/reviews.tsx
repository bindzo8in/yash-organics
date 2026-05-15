"use client";

import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { LeafVector } from "@/components/shared/leaf-vector";

const reviews = [
  {
    id: 1,
    name: "Ananya Sharma",
    role: "Lifestyle Blogger",
    content: "The Herbal Hair Oil has completely transformed my hair texture. It feels stronger and has a natural shine I haven't seen in years. Truly pure!",
    rating: 5
  },
  {
    id: 2,
    name: "Vikram Mehta",
    role: "Health Enthusiast",
    content: "Finally, a brand that actually delivers on its 'organic' promise. The nutrition range is exceptional. The quality of almonds is the best I've found in India.",
    rating: 5
  },
  {
    id: 3,
    name: "Priya Das",
    role: "Yoga Instructor",
    content: "The skincare masks are my weekend ritual. My skin feels soothed and refreshed without any of the tightness from chemical products.",
    rating: 5
  }
];

export function Reviews() {
  return (
    <section className="py-12 md:py-20 px-6 bg-background overflow-hidden relative">
      {/* Background Decor */}
      <LeafVector 
        src="/leaf/leaf-2.svg"
        className="absolute top-20 -right-20 w-[600px] h-[600px] opacity-[0.03] rotate-180"
        animate={{ y: [0, 20, 0], rotate: [180, 170, 180] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <LeafVector 
        src="/leaf/leaf-4.svg"
        className="absolute -bottom-40 -left-20 w-[600px] h-[600px] opacity-[0.03]"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.4em] font-bold text-primary/60"
          >
            Voices of Trust
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif"
          >
            From Our <span className="italic">Community</span>
          </motion.h2 >
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative p-12 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-emerald-50 hover:shadow-[0_40px_80px_rgba(16,185,129,0.08)] transition-all duration-700 group overflow-hidden"
            >
              <LeafVector 
                src="/leaf/leaf.svg"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 rotate-45"
                animate={{ scale: [1, 1.1, 1], rotate: [45, 50, 45] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute top-8 right-10 text-7xl text-emerald-50 font-serif leading-none group-hover:text-emerald-100 transition-colors pointer-events-none">
                &quot;
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                  ))}
                </div>

                <p className="text-xl font-serif text-foreground/90 leading-relaxed italic">
                  {review.content}
                </p>

                <div className="pt-8 flex items-center gap-4 border-t border-emerald-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-foreground">{review.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-600/60 font-bold mt-1">{review.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
