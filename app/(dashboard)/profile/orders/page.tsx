import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Package, Clock, CheckCircle2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <Link href="/profile">
          <Button variant="ghost" className="mb-4 p-0 hover:bg-transparent hover:text-primary group text-xs uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Button>
        </Link>

        <div className="flex items-center gap-4 border-b border-border pb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-primary">My Orders</h1>
            <p className="text-muted-foreground text-sm">Track and review your past purchases.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 text-center bg-white border border-border/50">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-serif mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven&apos;t placed any orders yet.</p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-border/50 p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.orderStatus)}
                        <p className="text-sm font-medium text-foreground">{order.orderStatus}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Total</p>
                      <p className="text-sm font-bold">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-2">
                      <div className="w-16 h-16 bg-muted relative rounded-sm overflow-hidden flex-shrink-0">
                         {item.product.productImages[0] ? (
                           // Using raw img tag here since Cloudinary URLs are external and next/image requires config
                           <img src={item.product.productImages[0].url} alt={item.product.name} className="absolute inset-0 w-full h-full object-cover" />
                         ) : (
                           <div className="absolute inset-0 flex items-center justify-center bg-secondary/10 text-xs text-muted-foreground">IMG</div>
                         )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-primary transition-colors">
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity} | Variant: {item.variant.name}</p>
                      </div>
                      <div className="text-sm font-medium">₹{(item.sellingPrice * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
