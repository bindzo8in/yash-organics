"use client";

import { useRouter } from "next/navigation";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewHeroSlidePage() {
  const router = useRouter();

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/hero-slides">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif">Create Hero Slide</h1>
          <p className="text-muted-foreground">Add a new spotlight to your home page.</p>
        </div>
      </div>

      <HeroSlideForm onSuccess={() => router.push("/admin/hero-slides")} />
    </div>
  );
}
