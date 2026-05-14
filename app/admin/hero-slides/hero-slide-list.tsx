"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Edit, MoveVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteHeroSlide, reorderHeroSlides } from "@/lib/actions/hero-slides";
import { Reorder, useDragControls } from "motion/react";

interface HeroSlideListProps {
  initialSlides: any[];
}

export function HeroSlideList({ initialSlides }: HeroSlideListProps) {
  const [slides, setSlides] = useState(initialSlides);
  const [isUpdating, setIsUpdating] = useState(false);

  const onReorder = async (newOrder: any[]) => {
    setSlides(newOrder);
    setIsUpdating(true);
    
    try {
      const reorderData = newOrder.map((slide, index) => ({
        id: slide.id,
        order: index,
      }));
      
      const res = await reorderHeroSlides(reorderData);
      if (res.success) {
        toast.success("Order updated");
      } else {
        toast.error(res.message);
        setSlides(initialSlides);
      }
    } catch (error) {
      toast.error("Failed to update order");
      setSlides(initialSlides);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    
    try {
      const res = await deleteHeroSlide(id);
      if (res.success) {
        toast.success(res.message);
        setSlides(slides.filter(s => s.id !== id));
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/5 border-2 border-dashed border-border rounded-lg">
        <p>No slides found. Create your first slide to start your home page gallery.</p>
      </div>
    );
  }

  return (
    <Reorder.Group 
      axis="y" 
      values={slides} 
      onReorder={onReorder} 
      className="space-y-4"
    >
      {slides.map((slide, index) => (
        <HeroSlideItem 
          key={slide.id} 
          slide={slide} 
          index={index}
          onDelete={() => handleDelete(slide.id)} 
        />
      ))}
    </Reorder.Group>
  );
}

function HeroSlideItem({ slide, index, onDelete }: { slide: any; index: number; onDelete: () => void }) {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={slide}
      dragListener={false}
      dragControls={controls}
      className="group flex items-center gap-6 p-4 bg-background border border-border rounded-lg hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing p-2 -ml-2 hover:bg-secondary/50 rounded transition-colors touch-none"
        >
          <MoveVertical className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="relative w-40 aspect-video rounded-md overflow-hidden bg-muted border border-border">
          <Image 
            src={slide.image} 
            alt={slide.title} 
            fill 
            className="object-cover pointer-events-none"
          />
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg select-none">{slide.title}</h3>
          {slide.isActive ? (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none">Active</Badge>
          ) : (
            <Badge variant="outline" className="opacity-50">Inactive</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1 select-none">{slide.subtitle || "No subtitle"}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 select-none">
          <span>Position: {index + 1}</span>
          <span>CTA: {slide.ctaText}</span>
          {slide.link && <span className="flex items-center gap-1 text-primary"><Eye className="h-3 w-3" /> {slide.link}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/admin/hero-slides/${slide.id}`}>
          <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-10 w-10 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}
