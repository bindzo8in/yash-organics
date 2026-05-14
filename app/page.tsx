import { HeroSlider } from "@/components/sections/home/hero-slider";
import { FeaturedCategories } from "@/components/sections/home/featured-categories";
import { BestSellers } from "@/components/sections/home/best-sellers";
import { PromoBanner } from "@/components/sections/home/promo-banner";
import { NewLaunch } from "@/components/sections/home/new-launch";
import { Reviews } from "@/components/sections/home/reviews";
import { CTASection } from "@/components/sections/home/cta-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getProducts } from "@/lib/services/product.service";
import { getFeaturedCategories } from "@/lib/services/category.service";
import * as motion from 'motion/react-client'
import prisma from "@/lib/prisma";
import { LeafVector } from "@/components/shared/leaf-vector";

export default async function Home() {
  const [
    { products: bestSellers }, 
    { products: newLaunches },
    categories,
    slides
  ] = await Promise.all([
    getProducts({ limit: 4, sort: "featured" }),
    getProducts({ limit: 4, sort: "newest" }),
    getFeaturedCategories(),
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    })
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* 1. Slide Section (Hero) */}
        <HeroSlider slides={slides} />

        {/* 2. Best Selling Products Section */}
        <BestSellers products={bestSellers} />

        {/* 3. Categories Section */}
        <FeaturedCategories categories={categories} />

        {/* 4. Banner Section */}
        <PromoBanner />

        {/* 5. New Launch Section */}
        <NewLaunch products={newLaunches} />

        {/* 6. Philosophy (Special Highlight) */}
        <section className="py-48 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50/30 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="space-y-16"
            >
              <div className="flex flex-col items-center gap-6">
                <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-emerald-600/60">Our Ethos</span>
                <div className="w-px h-16 bg-gradient-to-b from-emerald-600/60 to-transparent" />
              </div>

              <div className="relative">
                <h3 className="text-4xl md:text-7xl font-serif leading-[1.2] text-foreground tracking-tight">
                  &quot;Nature does not hurry, yet <br />
                  <span className="italic text-emerald-800/80">everything is accomplished.</span>&quot;
                </h3>
                
                {/* Decorative floating leaves */}
                <LeafVector 
                  src="/leaf/leaf-1.svg"
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-24 -right-24 md:-right-48 w-48 md:w-96 h-48 md:h-96"
                />
                <LeafVector 
                  src="/leaf/leaf-2.svg"
                  animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-24 -left-24 md:-left-48 w-48 md:w-96 h-48 md:h-96"
                />
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground italic font-serif text-2xl">
                  — Lao Tzu
                </p>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-600/40 font-bold max-w-md mx-auto leading-loose">
                  Embracing the wisdom of ancient rituals for modern nourishment.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 7. Review Section */}
        <Reviews />

        {/* 8. CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
