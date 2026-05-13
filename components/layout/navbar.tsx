"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Hair Care", href: "/category/hair-care" },
  { name: "Skin Care", href: "/category/skin-care" },
  { name: "Nutrition", href: "/category/nutrition" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3" 
          : "bg-transparent py-6"
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
          {navLinks.slice(0, 3).map((link) => (
            <Link key={link.name} href={link.href} className="nav-link">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-2xl font-serif tracking-widest uppercase">
            Yash <span className="text-primary">Organics</span>
          </h1>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="p-2 hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/profile" className="hidden md:block p-2 hover:text-primary transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="p-2 relative hover:text-primary transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Link>
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-background z-[70] p-8 shadow-2xl"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="text-2xl font-serif"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="mt-auto pt-8 border-t">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" /> My Profile
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
