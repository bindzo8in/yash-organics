import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, MapPin, Package, LogOut, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl">Hello, {session.user.name || "Customer"}</h1>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <Button type="submit" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/profile/orders">
            <div className="bg-white p-8 border border-border/50 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-serif text-xl">My Orders</h2>
              </div>
              <p className="text-muted-foreground text-sm">View your order history, track current shipments, and manage returns.</p>
            </div>
          </Link>

          <Link href="/profile/addresses">
            <div className="bg-white p-8 border border-border/50 hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-serif text-xl">Addresses</h2>
              </div>
              <p className="text-muted-foreground text-sm">Manage your delivery addresses for faster checkout experiences.</p>
            </div>
          </Link>

          {(session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN" ? (
            <Link href="/admin" className="md:col-span-2">
              <div className="bg-primary/5 p-8 border border-primary/20 hover:bg-primary/10 transition-colors h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-serif text-xl text-primary">Admin Dashboard</h2>
                </div>
                <p className="text-muted-foreground text-sm">Access the administrative dashboard to manage products, categories, and orders.</p>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
