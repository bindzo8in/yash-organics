import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AddressManager } from "@/components/sections/profile/address-manager";
import { MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfileAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/profile">
          <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent hover:text-primary group text-xs uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-primary">Manage Addresses</h1>
            <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove your delivery addresses.</p>
          </div>
        </div>

        <AddressManager />
      </div>
    </div>
  );
}
