"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?filter=parents");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = !isScrolled && isHome;
  const itemCount = totalItems();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3 text-foreground" 
          : isTransparent
            ? "bg-background/20 py-6 text-white"
            : "bg-background py-4 text-foreground border-b border-border/10"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="nav-link">Home</Link>
          
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(category.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                href={`/products?category=${category.slug}`} 
                className="nav-link flex items-center gap-1.5 group"
              >
                {category.name}
                {category.children && category.children.length > 0 && (
                  <ChevronDown className={cn(
                    "h-3 w-3 transition-transform duration-300",
                    activeDropdown === category.id && "rotate-180"
                  )} />
                )}
              </Link>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === category.id && category.children && category.children.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full -left-4 pt-4 z-50"
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-3 min-w-[200px]">
                      <div className="flex flex-col gap-1">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?category=${child.slug}`}
                            className="px-4 py-2.5 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-between group/item"
                          >
                            {child.name}
                            <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors block"
                        >
                          View All {category.name}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Perfectly Centered Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 group">
          <Image 
            src="/logo/logo-rect.webp" 
            alt="Yash Organics" 
            width={160} 
            height={50} 
            className={cn(
              "h-10 w-auto object-contain transition-all duration-300",
              
            )}
            priority
          />
        </Link>

        {/* Right Actions & Links */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-8 mr-2">
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
            <Link href="/products" className="nav-link">Shop All</Link>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/products" className="p-2 hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/profile" className="hidden md:block p-2 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="p-2 relative hover:text-primary transition-colors group">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold transition-transform group-hover:scale-110 px-1",
                  isTransparent ? "bg-emerald-400 text-black shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-primary text-white"
                )}>
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-background z-[70] flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-border/50">
                <h2 className="font-serif text-xl tracking-widest uppercase">Menu</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6">
                  <Link href="/" className="text-2xl font-serif hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </Link>
                  
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-4">
                      <Link 
                        href={`/products?category=${category.slug}`}
                        className="text-2xl font-serif flex items-center justify-between group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      {category.children && category.children.length > 0 && (
                        <div className="pl-4 flex flex-col gap-3 border-l border-border/50">
                          {category.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/products?category=${child.slug}`}
                              className="text-lg text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <Link href="/about" className="text-2xl font-serif hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    About
                  </Link>
                  <Link href="/contact" className="text-2xl font-serif hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Contact
                  </Link>
                  <Link href="/products" className="text-2xl font-serif hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Shop All
                  </Link>
                </div>
              </div>

              <div className="p-8 border-t border-border/50 bg-secondary/5">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  Account Settings
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
