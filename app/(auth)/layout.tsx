import Link from "next/link";

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
          <h1 className="text-2xl font-serif tracking-widest uppercase">
            Yash <span className="text-primary">Organics</span>
          </h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 -mt-16">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          © 2026 Yash Organics. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
