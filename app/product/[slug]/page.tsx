import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductInfo } from "@/components/shop/product-info";
import { ProductGallery } from "@/components/shop/product-gallery";
import { getImageUrl } from "@/lib/cloudinary-utils";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
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
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        orderBy: { price: "asc" }
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
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6">
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

          {/* Detailed Description / Story */}
          <div className="mt-32 border-t border-border pt-16 max-w-3xl">
            <h2 className="text-2xl font-serif mb-8 italic">The Essence of {product.name}</h2>
            <div className="prose prose-neutral prose-lg text-muted-foreground">
              <p>{product.description}</p>
              <p className="mt-6">
                Ethically sourced and handcrafted with care, this product represents 
                the pinnacle of our organic philosophy. Each ingredient is selected 
                for its purity and potency, ensuring a truly transformative experience.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
