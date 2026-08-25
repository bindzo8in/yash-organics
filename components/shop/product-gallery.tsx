"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;

    const swipeDistance = touchEndX - touchStartX.current;
    if (Math.abs(swipeDistance) >= 50) {
      setSelectedImage((currentImage) =>
        swipeDistance < 0
          ? (currentImage + 1) % images.length
          : (currentImage - 1 + images.length) % images.length
      );
    }

    touchStartX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      {/* Thumbnails (Amazon Style on the Left) */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide lg:w-20 shrink-0">
          {images.map((img, index) => (
            <button
              key={index}
              onMouseEnter={() => setSelectedImage(index)}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square w-16 sm:w-20 lg:w-full shrink-0 bg-white overflow-hidden transition-all duration-300",
                "border-2",
                selectedImage === index 
                  ? "border-primary shadow-sm" 
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Viewport with Magnification */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 aspect-square touch-pan-y bg-white overflow-hidden border border-border/10 cursor-zoom-in"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            {/* Base Image */}
            <Image
              src={images[selectedImage]}
              alt={name}
              fill
              sizes="(min-width: 1024px) calc(100vw - 104px), 100vw"
              className={cn(
                "object-contain p-4 transition-opacity duration-300",
                isHovered ? "opacity-0" : "opacity-100"
              )}
              priority
            />

            {/* Magnified Image */}
            {isHovered && (
              <div 
                className="absolute inset-0 z-10 w-full h-full pointer-events-none"
                style={{
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '250%', // 2.5x zoom
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Quality Badge */}
        {!isHovered && (
          <div className="absolute top-6 right-6 z-20">
             <div className="bg-white/80 backdrop-blur-md border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">100% Organic</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
