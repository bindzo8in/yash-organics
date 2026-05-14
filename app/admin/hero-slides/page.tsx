import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { Plus, Image as ImageIcon, Trash2, Edit, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { HeroSlideList } from "./hero-slide-list";

export default async function HeroSlidesPage() {
  
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif">Home Hero Slides</h1>
          <p className="text-muted-foreground">Manage the main carousel on your home page.</p>
        </div>
        <Link href="/admin/hero-slides/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Slide
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Slides</CardTitle>
          <CardDescription>
            You can have up to 5 active slides for optimal performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroSlideList initialSlides={slides} />
        </CardContent>
      </Card>
    </div>
  );
}
