import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple Header */}
      <header className="p-8 flex justify-center">
        <Link href="/">
          <Image 
            src="/logo/logo-rect.webp" 
            alt="Yash Organics" 
            width={180} 
            height={50} 
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 -mt-16">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} Yash Organics. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
