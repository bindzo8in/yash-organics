import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-emerald-50/30 border-t border-emerald-100/50 py-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
        {/* Brand Section */}
        <div className="md:col-span-4 space-y-8">
          <Link href="/" className="inline-block group">
            <h2 className="text-2xl font-serif tracking-[0.2em] uppercase transition-colors group-hover:text-emerald-700">
              Yash <span className="text-emerald-600">Organics</span>
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Handcrafted with love and rooted in ancient wisdom. 
            We bring you the purest organic essentials for a balanced, conscious lifestyle.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.94v-3.411h2.94v-2.517c0-2.915 1.78-4.502 4.379-4.502 1.244 0 2.315.093 2.626.135v3.044h-1.802c-1.415 0-1.688.672-1.688 1.658v2.182h3.37l-.439 3.411h-2.931v8.74h6.107c.731 0 1.324-.593 1.324-1.324v-21.351c0-.732-.593-1.325-1.324-1.325z"/>
              </svg>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Links Grid */}
        <div className="md:col-span-5 grid grid-cols-2 gap-8">
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-emerald-900/40">Shop Essentials</h4>
            <ul className="space-y-4">
              <li><Link href="/category/hair-care" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Hair Care</Link></li>
              <li><Link href="/category/skin-care" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Skin Care</Link></li>
              <li><Link href="/category/nutrition" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Premium Nutrition</Link></li>
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">View All Products</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-emerald-900/40">Our Story</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Philosophy</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Get in Touch</Link></li>
              <li><Link href="/shipping" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Delivery Info</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-emerald-700 hover:translate-x-1 transition-all inline-block">Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact/Newsletter Section */}
        <div className="md:col-span-3 space-y-8">
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-emerald-900/40">Our Studio</h4>
          <div className="space-y-4 text-sm text-muted-foreground leading-loose">
            <p>123 Organic Lane, Green Valley<br />Rajasthan, India 302001</p>
            <p>hello@yashorganics.com<br />+91 98765 43210</p>
          </div>
          <div className="pt-4">
             <Link href="/contact" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 group">
               Directions <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
             </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-900/30 font-bold">
          © 2026 Yash Organics. Rooted in Nature.
        </p>
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] text-emerald-900/30 font-bold">
          <Link href="/privacy" className="hover:text-emerald-700 transition-colors">Privacy Ritual</Link>
          <Link href="/terms" className="hover:text-emerald-700 transition-colors">Terms of Harmony</Link>
        </div>
      </div>
    </footer>
  );
}
