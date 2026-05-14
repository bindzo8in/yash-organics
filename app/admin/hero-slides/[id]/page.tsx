import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { HeroSlideFormWrapper } from "./hero-slide-form-wrapper";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const slide = await prisma.heroSlide.findUnique({
    where: { id },
  });

  if (!slide) {
    notFound();
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/hero-slides">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif">Edit Hero Slide</h1>
          <p className="text-muted-foreground">Modify your existing home page content.</p>
        </div>
      </div>

      <HeroSlideFormWrapper initialData={slide} />
    </div>
  );
}
