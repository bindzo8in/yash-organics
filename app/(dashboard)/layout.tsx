import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getNavbarCategories } from "@/lib/services/category.service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, categories] = await Promise.all([
    auth(),
    getNavbarCategories()
  ]);

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar categories={categories} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
