import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Package, Truck, Calendar, MapPin, Phone, Mail, AlertCircle, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PriceDisplay } from "@/components/shared/price-display";
import { cn } from "@/lib/utils";
import { OrderTimeline } from "@/components/shared/order-timeline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              productImages: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          variant: true,
        },
      },
      address: true,
    },
  });

  if (!order) notFound();

  const isPaid = order.paymentStatus === "PAID";
  const isPending = order.paymentStatus === "PENDING";
  const isFailed = order.paymentStatus === "FAILED";
  const isCancelled = order.orderStatus === "CANCELLED";
  const isReturned = ["RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED", "RETURNED", "REFUNDED"].includes(order.orderStatus);

  const getStatusContent = () => {
    if (isCancelled) return { title: "Order Cancelled", description: "This order has been cancelled.", color: "bg-red-100", icon: <AlertCircle className="w-10 h-10 text-red-600" /> };
    if (order.orderStatus === "REFUNDED") return { title: "Order Refunded", description: "Your payment has been successfully refunded.", color: "bg-slate-100", icon: <Package className="w-10 h-10 text-slate-600" /> };
    if (isReturned) return { title: "Return Status", description: `Your return is currently ${order.orderStatus.replace('_', ' ')}.`, color: "bg-orange-100", icon: <RotateCcw className="w-10 h-10 text-orange-600" /> };
    if (isPaid) return { title: "Order Confirmed!", description: "Thank you for shopping with YASH.", color: "bg-primary/10", icon: <CheckCircle2 className="w-10 h-10 text-primary" /> };
    if (isPending) return { title: "Order Processing...", description: "We're waiting for payment confirmation.", color: "bg-amber-100", icon: <Package className="w-10 h-10 text-amber-600 animate-pulse" /> };
    return { title: "Payment Unsuccessful", description: "Something went wrong with the payment.", color: "bg-destructive/10", icon: <Package className="w-10 h-10 text-destructive" /> };
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Success/Status Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
            statusContent.color
          )}>
            {statusContent.icon}
          </div>
          <h1 className="font-serif text-4xl text-primary mb-2">
            {statusContent.title}
          </h1>
          <p className="text-muted-foreground">
            {statusContent.description} Order <span className="font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</span>
          </p>
          
          {(isPending || isFailed) && (
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/checkout">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-8">
                  Retry Payment
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6 border-foreground/5 bg-white">
              <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Items Ordered
              </h2>
              <div className="space-y-6">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-muted flex-shrink-0 overflow-hidden">
                      {item.productImage || (item.product && item.product.productImages && item.product.productImages[0]?.url) ? (
                        <Image 
                          src={item.productImage || item.product.productImages[0]?.url} 
                          alt={item.productName || (item.product && item.product.name)}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-[10px] text-primary/40 uppercase font-bold">Image</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm">{item.productName || (item.product && item.product.name)}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Variant: {item.variantName || (item.variant && item.variant.name)}</p>
                      <p className="text-xs mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <PriceDisplay price={item.sellingPrice * item.quantity} className="justify-end text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Details */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-foreground/5 bg-white h-full">
                <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Delivery Details
                </h2>
                <div className="text-sm space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">{order.address.fullName}</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {order.address.addressLine1}<br />
                        {order.address.addressLine2 && <>{order.address.addressLine2}<br /></>}
                        {order.address.city}, {order.address.state} - {order.address.postalCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-primary/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{order.address.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{order.address.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground italic">Placed on: {order.createdAt.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-foreground/5 bg-white h-full overflow-hidden">
                <h2 className="font-serif text-xl mb-8 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Live Tracking
                </h2>
                <div className="scale-90 origin-top-left -mt-2">
                  <OrderTimeline order={order} />
                </div>
              </Card>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-foreground/5 bg-white">
               <h2 className="font-serif text-xl mb-6">Payment Info</h2>
               <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="text-green-600 font-bold uppercase tracking-wider text-[10px] bg-green-50 px-2 py-1 rounded">{order.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Status</span>
                    <span className="text-primary font-bold uppercase tracking-wider text-[10px] bg-primary/5 px-2 py-1 rounded">{order.orderStatus}</span>
                  </div>
                  
                  <Separator className="bg-foreground/5 my-4" />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="font-medium">₹{order.deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif pt-2">
                    <span>Total Paid</span>
                    <span className="text-primary font-bold">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
               </div>
            </Card>

            <Link href="/products" className="block">
              <Button variant="outline" className="w-full rounded-none py-6 border-primary text-primary hover:bg-primary/5">
                Continue Shopping
              </Button>
            </Link>
            
            <Link href="/profile/orders" className="block">
              <Button className="w-full rounded-none py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
