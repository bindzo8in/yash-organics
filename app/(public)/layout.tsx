import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getNavbarCategories } from "@/lib/services/category.service";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getNavbarCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar categories={categories} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
