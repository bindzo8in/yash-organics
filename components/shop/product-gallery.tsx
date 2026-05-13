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
    <div className="space-y-6">
      {/* Main Image Container */}
      <div className="relative aspect-[4/5] bg-secondary/20 overflow-hidden rounded-sm group">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <Image
              src={images[selectedImage]}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Subtle overlay for luxury feel */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square bg-secondary/10 overflow-hidden rounded-sm transition-all duration-300",
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
    </div>
  );
}
