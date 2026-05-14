import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Package, Clock, CheckCircle2, Truck, AlertCircle, RotateCcw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderCard } from "@/components/shared/order-card";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: { 
          product: {
            include: { productImages: { where: { isPrimary: true }, take: 1 } }
          }, 
          variant: true 
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <Link href="/profile">
            <Button variant="ghost" className="mb-6 p-0 hover:bg-transparent hover:text-primary group text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Profile
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary/10 pb-8">
            <div className="space-y-2">
              <h1 className="font-serif text-4xl md:text-5xl text-primary tracking-tight">Order History</h1>
              <p className="text-muted-foreground font-light tracking-wide italic">A curated record of your organic journey with us.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <Package className="w-4 h-4" />
              <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total</span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="py-24 text-center bg-white border border-primary/5 rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-primary/30" />
            </div>
            <h3 className="text-2xl font-serif text-primary mb-3">No orders yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 font-light leading-relaxed">
              Your organic pantry is waiting to be filled. Explore our collection of premium organic products and start your journey.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-full">
              <Link href="/products">Shop the Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


