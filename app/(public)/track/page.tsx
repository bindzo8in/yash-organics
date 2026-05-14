"use client";

import { useState } from "react";
import { Search, Package, ArrowRight, Loader2, Truck, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { OrderTimeline } from "@/components/shared/order-timeline";
import { Separator } from "@/components/ui/separator";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/track?id=${orderId}&phone=${phone}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4 tracking-tight">Track Your Journey</h1>
          <p className="text-muted-foreground font-light tracking-wide italic max-w-md mx-auto">
            Enter your order details below to see the current status of your organic essentials.
          </p>
        </div>

        <Card className="p-8 border-primary/5 shadow-xl bg-white rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
          
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1">Order ID</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input 
                    placeholder="e.g. cm0abc..." 
                    className="pl-10 h-12 rounded-xl border-primary/10 focus:border-primary transition-all"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-1">Mobile Number</label>
                <div className="relative">
                  <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input 
                    placeholder="10-digit mobile" 
                    className="pl-10 h-12 rounded-xl border-primary/10 focus:border-primary transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold tracking-widest uppercase text-xs group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Locate Order
                  <Search className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <div className="w-1 h-1 bg-red-600 rounded-full" />
              {error}
            </div>
          )}
        </Card>

        {order && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Status</p>
                <p className="text-xs font-bold text-primary">{order.orderStatus}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Items</p>
                <p className="text-xs font-bold text-primary">{order.orderItems.length} Products</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Date</p>
                <p className="text-xs font-bold text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total</p>
                <p className="text-xs font-bold text-primary">₹{order.totalAmount}</p>
              </div>
            </div>

            <Card className="p-8 md:p-12 border-primary/5 shadow-xl bg-white rounded-3xl overflow-hidden relative">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-serif text-2xl text-primary tracking-tight">Delivery History</h2>
                  {order.trackingUrl && (
                    <a 
                      href={order.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Courier Site <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <OrderTimeline order={order} />
              </div>
            </Card>

            {/* Delivery Snapshot */}
            <Card className="p-8 border-primary/5 bg-white/50 backdrop-blur rounded-3xl">
              <div className="flex flex-col md:flex-row gap-8 justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shipping Destination
                  </h3>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground mb-1">{order.shippingName}</p>
                    <p className="max-w-xs">{order.shippingAddress}</p>
                  </div>
                </div>
                {order.trackingId && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Courier Details
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      <p><span className="font-bold text-foreground">Partner:</span> {order.courierPartner}</p>
                      <p><span className="font-bold text-foreground">Tracking ID:</span> {order.trackingId}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
