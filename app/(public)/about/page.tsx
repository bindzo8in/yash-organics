import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Yash Organics",
  description: "Learn about the story behind Yash Organics and our commitment to pure, natural ingredients.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">Our Heritage</span>
            <h1 className="text-5xl md:text-7xl font-serif">Our Story</h1>
          </div>
          
          <div className="relative aspect-video bg-muted overflow-hidden">
            {/* Fallback styling if image not found */}
            <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
               <span className="font-serif italic text-muted-foreground">Cultivating Purity</span>
            </div>
            <Image 
              src="/images/organic_hero_background.png" 
              alt="Yash Organics Heritage" 
              fill 
              className="object-cover" 
            />
          </div>
          
          <div className="prose prose-lg prose-neutral mx-auto text-muted-foreground leading-relaxed">
            <p>
              Yash Organics was born from a simple, profound belief: nature provides the best ingredients for our well-being.
              Our journey began with a quest to find pure, unadulterated herbal products in a market flooded with synthetics.
            </p>
            <p>
              We partner directly with organic farmers across the country to source the finest raw materials. 
              Every oil, powder, and supplement we create is handcrafted in small batches to preserve its natural potency and essence.
            </p>
            <p>
              Our mission is to bring the healing power of nature to your daily routine, without compromise. We believe that what you put on your body is just as important as what you put in it.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
