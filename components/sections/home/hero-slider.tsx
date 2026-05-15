"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { getImageUrl } from "@/lib/cloudinary-utils";

const defaultSlides = [
  {
    id: "default-1",
    title: "Experience the Purity of Earth",
    subtitle: "Rooted in Nature",
    description: "Discover our collection of 100% organic herbs and oils, handcrafted to restore your natural balance.",
    image: "/images/organic_hero_background.png",
    link: "/products",
    ctaText: "Shop Collection",
    color: "text-primary"
  },
  {
    id: "default-2",
    title: "Ancient Wisdom for Modern Glow",
    subtitle: "Organic Skincare",
    description: "Reveal your skin's innate radiance with our chemical-free botanical masks and serums.",
    image: "/images/category_skin_care.png",
    link: "/products?category=skin-care",
    ctaText: "Explore Skincare",
    color: "text-accent"
  }
];

interface HeroSliderProps {
  slides: any[];
}

export function HeroSlider({ slides: dbSlides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const slides = dbSlides.length > 0 ? dbSlides : defaultSlides;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  if (!slides.length) return null;

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={getImageUrl(slides[current].image)}
            alt={slides[current].title}
            fill
            className="object-cover scale-105"
            priority
          />
          {/* Enhanced Gradient Overlay for Text Visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <span className={`text-xs uppercase tracking-[0.4em] block font-bold ${slides[current].color || 'text-emerald-400'}`}>
                {slides[current].subtitle}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-serif leading-[1.1] text-white drop-shadow-sm">
                {slides[current].title.split(" ").map((word: string, i: number) => (
                  <span key={i} className={i % 3 === 2 ? "italic block md:inline" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>
              <p className="text-white/80 text-lg max-w-lg leading-relaxed font-medium">
                {slides[current].description}
              </p>
              <div className="pt-6">
                <Link href={slides[current].link || "/products"} className="btn-minimal group bg-white/80 backdrop-blur-sm px-8 py-4 inline-flex items-center">
                  {slides[current].ctaText || "Shop Now"}
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-6 right-6 md:left-auto md:right-12 z-20 flex items-center justify-between md:justify-end gap-6">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-500 ${
                current === i ? "w-12 bg-emerald-500" : "w-6 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-4 ml-6">
          <button 
            onClick={prev}
            className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button 
            onClick={next}
            className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full overflow-hidden">
        <motion.div 
          key={current}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 8, ease: "linear" }}
          className="h-full bg-primary"
        />
      </div>
    </section>
  );
}
