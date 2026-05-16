import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/shop/product-card";
import { motion } from "motion/react";
import * as React from "react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true }
  });

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | Yash Organics`,
    description: category.description || `Pure, organic ${category.name} for your modern lifestyle.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: {
          category: true,
          variants: true,
          productImages: true
        },
        orderBy: { createdAt: "desc" }
      },
      children: {
        include: {
          products: {
            where: { isActive: true },
            include: {
              category: true,
              variants: true,
              productImages: true
            }
          }
        }
      }
    },
  });

  if (!category) {
    notFound();
  }

  // Combine products from category and subcategories
  const allProducts = [...category.products];
  category.children.forEach(sub => {
    allProducts.push(...sub.products);
  });

  // Remove duplicates if any (though logic should prevent them)
  const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <div className="space-y-4">
             <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold">The Collection</span>
             <h1 className="text-5xl md:text-7xl font-serif tracking-tight">
               {category.name}
             </h1>
             {category.description && (
               <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed">
                 {category.description}
               </p>
             )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-6">
          {uniqueProducts.length === 0 ? (
            <div className="py-40 text-center space-y-4">
              <div className="h-12 w-12 border-2 border-dashed border-border rounded-full mx-auto" />
              <p className="text-muted-foreground font-serif italic text-xl">
                We are currently crafting new items for this collection...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {uniqueProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
