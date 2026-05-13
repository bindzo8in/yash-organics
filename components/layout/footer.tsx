import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-widest uppercase">
            Yash <span className="text-primary">Organics</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Handcrafted with love and rooted in ancient wisdom. 
            We bring you the purest organic essentials for a balanced lifestyle.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Shop</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link href="/category/hair-care" className="hover:text-primary transition-colors">Hair Care</Link></li>
            <li><Link href="/category/skin-care" className="hover:text-primary transition-colors">Skin Care</Link></li>
            <li><Link href="/category/nutrition" className="hover:text-primary transition-colors">Nutrition</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-4">Join our list for organic wellness tips.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-primary flex-1"
            />
            <button className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Join</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          © 2026 Yash Organics. All rights reserved.
        </p>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
