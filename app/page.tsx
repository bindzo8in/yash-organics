"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/organic_hero_background.png"
              alt="Organic Hero"
              fill
              className="object-cover scale-110"
              priority
            />
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="relative z-10 text-center max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xs uppercase tracking-[0.4em] mb-6 block text-primary font-bold"
            >
              Rooted in Nature
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-5xl md:text-8xl font-serif leading-[1.1] mb-10"
            >
              Experience the <br /> 
              <span className="italic">Purity of Earth</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <Link href="/category/hair-care" className="btn-minimal group">
                Discover Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Categories Section - Immersive Scroll */}
        <section className="py-32 px-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-32">
            
            {/* Hair Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative aspect-[4/5] overflow-hidden"
              >
                <Image
                  src="/images/category_hair_care.png"
                  alt="Hair Care"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="space-y-8"
              >
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Category 01</span>
                <h2 className="text-4xl md:text-6xl font-serif">Hair Revitalization</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Handcrafted oils and serums infused with ancient Himalayan herbs. 
                  Designed to restore strength, shine, and natural balance from root to tip.
                </p>
                <Link href="/category/hair-care" className="inline-flex items-center text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all">
                  Explore Hair Care
                </Link>
              </motion.div>
            </div>

            {/* Skin Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="order-2 md:order-1 space-y-8 text-right md:text-left"
              >
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Category 02</span>
                <h2 className="text-4xl md:text-6xl font-serif">Skin Radiance</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Pure botanical powders and clay masks. No chemicals, just the raw power 
                  of nature to reveal your skin&apos;s innate glow.
                </p>
                <Link href="/category/skin-care" className="inline-flex items-center text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all">
                  Explore Skin Care
                </Link>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="order-1 md:order-2 relative aspect-[4/5] overflow-hidden"
              >
                <Image
                  src="/images/category_skin_care.png"
                  alt="Skin Care"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </motion.div>
            </div>

            {/* Nutrition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative aspect-[4/5] overflow-hidden"
              >
                <Image
                  src="/images/category_nutrition.png"
                  alt="Nutrition"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="space-y-8"
              >
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Category 03</span>
                <h2 className="text-4xl md:text-6xl font-serif">Daily Nutrition</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Premium dry fruits and superfoods sourced from the finest orchards. 
                  Pure, unadulterated energy for your modern lifestyle.
                </p>
                <Link href="/category/nutrition" className="inline-flex items-center text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all">
                  Explore Nutrition
                </Link>
              </motion.div>
            </div>

          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-40 bg-secondary/30 text-center px-6">
          <div className="max-w-3xl mx-auto space-y-10">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-serif"
            >
              &quot;Nature does not hurry, yet everything is accomplished.&quot;
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground italic"
            >
              — Lao Tzu
            </motion.p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
