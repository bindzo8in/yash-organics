"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-4 w-full md:w-24 shrink-0">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square w-20 md:w-full bg-secondary/10 overflow-hidden rounded-sm transition-all duration-300",
                selectedImage === index 
                  ? "ring-1 ring-primary ring-offset-2" 
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div className="relative flex-1 aspect-square bg-secondary/5 overflow-hidden rounded-sm group shadow-sm border border-border/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full w-full p-8"
          >
            <Image
              src={images[selectedImage]}
              alt={name}
              fill
              className="object-contain p-4"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Subtle overlay for luxury feel */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Quality Badge (Optional from image reference) */}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-sm border border-border/50 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          100% Organic
        </div>
      </div>
    </div>
  );
}
