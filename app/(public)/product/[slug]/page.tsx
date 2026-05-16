import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductInfo } from "@/components/shop/product-info";
import { ProductGallery } from "@/components/shop/product-gallery";
import { getImageUrl } from "@/lib/cloudinary-utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { 
      slug,
      deletedAt: null 
    },
    select: { name: true, description: true }
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Yash Organics`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Yash Organics`,
      description: product.description,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { 
      slug,
      deletedAt: null 
    },
    include: {
      category: true,
      variants: {
        orderBy: { sellingPrice: "asc" }
      },
      productImages: {
        orderBy: { isPrimary: "desc" }
      }
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Left: Product Images */}
          <ProductGallery 
            images={product.productImages.map(img => getImageUrl(img.url))} 
            name={product.name} 
          />

          {/* Right: Product Details */}
          <ProductInfo product={product} />
        </div>

        {/* The Product Story Section - Aesthetic & Professional */}
        <div className="mt-40 space-y-32">
          {/* 01. Benefits Grid */}
          {product.benefits && (
            <section className="relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40">Philosophy</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight italic">
                      Why your skin <br /> will love this.
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                    {product.benefits.split("\n").filter(b => b.trim()).map((benefit, i) => (
                      <div key={i} className="space-y-3 p-6 border border-primary/5 bg-primary/[0.02] rounded-sm hover:bg-primary/[0.04] transition-colors">
                        <div className="text-xs font-serif italic text-primary/40">0{i + 1}</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {benefit.replace(/^[•-]\s*/, "")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full aspect-square relative bg-secondary/10 rounded-sm overflow-hidden group">
                   {/* Using the first product image as a featured visual if available */}
                   <Image 
                      src={getImageUrl(product.productImages[0]?.url || "/placeholder-product.png")} 
                      alt="The Ritual" 
                      fill 
                      className="object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000"
                   />
                   <div className="absolute inset-0 bg-primary/5" />
                </div>
              </div>
            </section>
          )}

          {/* 02. The Ritual (Usage) */}
          {product.usage && (
            <section className="bg-secondary/5 -mx-6 px-6 py-24 md:py-32">
              <div className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40">The Ritual</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">
                    How to experience <br /> the transformation.
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                  {product.usage.split("\n").filter(u => u.trim()).slice(0, 3).map((step, i) => (
                    <div key={i} className="space-y-4 relative">
                      <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-xs font-serif text-primary italic">
                        {i + 1}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        {step.replace(/^[0-9.]\s*/, "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 03. Pure Ingredients */}
          {product.ingredients && (
            <section className="pb-24">
              <div className="flex flex-col items-center text-center space-y-16">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40">Composition</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">
                    Nurtured by Nature, <br /> Proven by Science.
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
                  {product.ingredients.split(",").map((ing, i) => (
                    <span key={i} className="px-8 py-4 border border-border/60 text-xs uppercase tracking-widest font-medium hover:border-primary/40 hover:text-primary transition-all duration-500 cursor-default">
                      {ing.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm max-w-xl leading-relaxed italic opacity-60">
                  *Our ingredients are ethically sourced, 100% organic, and free from harmful parabens, 
                  sulfates, and synthetic fragrances. Hand-bottled with love in small batches.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
