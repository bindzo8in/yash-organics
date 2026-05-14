"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const heroSlideSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  link: z.string().optional(),
  ctaText: z.string().default("Shop Now"),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type HeroSlideState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createHeroSlide(prevState: any, formData: FormData): Promise<HeroSlideState> {
  const validatedFields = heroSlideSchema.safeParse({
    title: formData.get("title") as string,
    subtitle: (formData.get("subtitle") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    image: formData.get("image") as string,
    link: (formData.get("link") as string) || undefined,
    ctaText: (formData.get("ctaText") as string) || "Shop Now",
    order: Number(formData.get("order")) || 0,
    isActive: formData.get("isActive") === "true",
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.heroSlide.create({
      data: validatedFields.data,
    });
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true, message: "Hero slide created successfully" };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, message: "Failed to create hero slide" };
  }
}

export async function updateHeroSlide(id: string, prevState: any, formData: FormData): Promise<HeroSlideState> {
  const validatedFields = heroSlideSchema.safeParse({
    title: formData.get("title") as string,
    subtitle: (formData.get("subtitle") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    image: formData.get("image") as string,
    link: (formData.get("link") as string) || undefined,
    ctaText: (formData.get("ctaText") as string) || "Shop Now",
    order: Number(formData.get("order")) || 0,
    isActive: formData.get("isActive") === "true",
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.heroSlide.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true, message: "Hero slide updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update hero slide" };
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    await prisma.heroSlide.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true, message: "Hero slide deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete hero slide" };
  }
}

export async function getHeroSlides() {
  return await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });
}
export async function reorderHeroSlides(slides: { id: string; order: number }[]) {
  try {
    const transactions = slides.map((slide) =>
      prisma.heroSlide.update({
        where: { id: slide.id },
        data: { order: slide.order },
      })
    );
    await prisma.$transaction(transactions);
    revalidatePath("/");
    revalidatePath("/admin/hero-slides");
    return { success: true, message: "Slides reordered successfully" };
  } catch (error) {
    console.error("Reorder error:", error);
    return { success: false, message: "Failed to reorder slides" };
  }
}
