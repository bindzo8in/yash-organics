import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Package, Truck, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PriceDisplay } from "@/components/shared/price-display";
import { cn } from "@/lib/utils";

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
          product: true,
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Success/Status Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
            isPaid ? "bg-primary/10" : isPending ? "bg-amber-100" : "bg-destructive/10"
          )}>
            {isPaid ? (
              <CheckCircle2 className="w-10 h-10 text-primary" />
            ) : isPending ? (
              <Package className="w-10 h-10 text-amber-600 animate-pulse" />
            ) : (
              <Package className="w-10 h-10 text-destructive" />
            )}
          </div>
          <h1 className="font-serif text-4xl text-primary mb-2">
            {isPaid ? "Order Confirmed!" : isPending ? "Order Processing..." : "Payment Unsuccessful"}
          </h1>
          <p className="text-muted-foreground">
            {isPaid ? (
              <>Thank you for shopping with YASH. Your order <span className="font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</span> has been placed successfully.</>
            ) : isPending ? (
              <>We've received your order <span className="font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</span> and are waiting for payment confirmation.</>
            ) : (
              <>Something went wrong with the payment for order <span className="font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</span>.</>
            )}
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
                    <div className="relative w-20 h-24 bg-muted flex-shrink-0">
                      {/* Note: Ideally we'd have a product image here, fetching first primary for now if exists */}
                      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-[10px] text-primary/40 uppercase font-bold">Image</div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Variant: {item.variant.name}</p>
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
            <Card className="p-6 border-foreground/5 bg-white">
              <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Delivery Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-8 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">{order.address.fullName}</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {order.address.addressLine1}<br />
                        {order.address.addressLine2 && <>{order.address.addressLine2}<br /></>}
                        {order.address.city}, {order.address.state} - {order.address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <Phone className="w-4 h-4 text-muted-foreground" />
                     <span className="text-muted-foreground">{order.address.phone}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Mail className="w-4 h-4 text-muted-foreground" />
                     <span className="text-muted-foreground">{order.address.email}</span>
                   </div>
                   <div className="flex items-center gap-2 pt-2">
                     <Calendar className="w-4 h-4 text-muted-foreground" />
                     <span className="text-muted-foreground">Placed on: {order.createdAt.toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </Card>
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
