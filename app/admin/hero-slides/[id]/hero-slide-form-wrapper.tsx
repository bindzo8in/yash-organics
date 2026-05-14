"use client";

import { useRouter } from "next/navigation";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

export function HeroSlideFormWrapper({ initialData }: { initialData: any }) {
  const router = useRouter();

  return (
    <HeroSlideForm 
      initialData={initialData} 
      onSuccess={() => router.push("/admin/hero-slides")} 
    />
  );
}
