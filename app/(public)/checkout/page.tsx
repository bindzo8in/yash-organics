"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/hooks/use-cart";
import { AddressManager } from "@/components/sections/profile/address-manager";
import { checkDeliveryAvailability, DeliveryEstimate } from "@/lib/services/delivery.service";
import { createOrder, verifyPayment } from "@/lib/actions/order.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Truck, CreditCard, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getAddresses } from "@/lib/actions/address.actions";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    // Initial load of addresses to get default pincode
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const data = await getAddresses();
    setAddresses(data);
    const defaultAddr = data.find(a => a.isDefault) || data[0];
    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
  };

  const selectedAddress = useMemo(() => 
    addresses.find(a => a.id === selectedAddressId),
  [addresses, selectedAddressId]);
  
  const currentTotal = totalPrice();

  useEffect(() => {
    const getDeliveryEstimate = async () => {
      if (!selectedAddress) {
        setDeliveryEstimate(null);
        return;
      }
      
      setIsCheckingDelivery(true);
      try {
        const estimate = await checkDeliveryAvailability(selectedAddress.postalCode, currentTotal);
        setDeliveryEstimate(estimate);
      } catch (err) {
        console.error("Error checking delivery:", err);
        setDeliveryEstimate({
          isAvailable: false,
          deliveryCharge: 0,
          estimatedDays: 0,
          message: "Failed to verify delivery availability."
        });
      } finally {
        setIsCheckingDelivery(false);
      }
    };

    getDeliveryEstimate();
  }, [selectedAddress, currentTotal]);

  const totalPayable = useMemo(() => {
    return totalPrice() + (deliveryEstimate?.deliveryCharge || 0);
  }, [totalPrice, deliveryEstimate]);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!deliveryEstimate?.isAvailable) {
      toast.error("Delivery not available for this location");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on server
      const result = await createOrder({
        addressId: selectedAddressId,
        cartItems: items,
        totalAmount: totalPrice(),
      });

      if (!result.success || !result.orderId) throw new Error(result.error || "Failed to create order");

      // 2. Initialize Razorpay
      const options = {
        key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: result.amount,
        currency: result.currency,
        name: "YASH Organics",
        description: "Organic & Herbal Wellness",
        order_id: result.razorpayOrderId,
        handler: async function (response: any) {
          console.log("Payment Response: ", response);
          // 3. Verify payment on server
          try {
            const verification = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: result.orderId,
            });

            if (verification.success) {
              toast.success("Payment successful!");
              clearCart();
              router.push(`/order-status/${result.orderId}`);
            } else {
              toast.error(verification.error || "Payment verification failed");
            }
          } catch (err: any) {
            console.error(err)
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: selectedAddress?.fullName,
          email: selectedAddress?.email,
          contact: selectedAddress?.phone,
        },
        theme: {
          color: "#3A4D39", // Moss green brand color
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    if (typeof window !== "undefined") router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h1 className="font-serif text-4xl text-primary">Checkout</h1>
          <ChevronRight className="text-muted-foreground w-6 h-6" />
          <span className="text-muted-foreground uppercase tracking-widest text-sm">Delivery & Payment</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Shipping Address */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="font-serif text-2xl">Delivery Address</h2>
              </div>
              <AddressManager 
                isSelectionMode 
                selectedId={selectedAddressId || undefined}
                onSelect={(id) => {
                  setSelectedAddressId(id);
                  loadAddresses(); // Refresh addresses list
                }} 
              />
            </section>

            {/* 2. Delivery Options */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="font-serif text-2xl">Delivery Method</h2>
              </div>
              
              {isCheckingDelivery ? (
                <div className="flex items-center gap-3 p-6 border border-foreground/5 bg-white">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Checking delivery availability...</span>
                </div>
              ) : deliveryEstimate ? (
                <Card className={cn(
                  "p-6 border-foreground/5",
                  !deliveryEstimate.isAvailable && "bg-destructive/5 border-destructive/20"
                )}>
                  <div className="flex items-start gap-4">
                    <Truck className={cn(
                      "w-6 h-6 mt-1",
                      deliveryEstimate.isAvailable ? "text-primary" : "text-destructive"
                    )} />
                    <div>
                      <p className="font-medium">
                        {deliveryEstimate.isAvailable ? "Standard Home Delivery" : "Not Serviceable"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {deliveryEstimate.message}
                      </p>
                      {deliveryEstimate.isAvailable && (
                        <p className="text-xs font-medium text-primary mt-2">
                          Estimated Delivery: {deliveryEstimate.estimatedDays} Business Days
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <p className="text-sm text-muted-foreground italic">Please select an address to see delivery options.</p>
              )}
            </section>

            {/* 3. Review Items */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
                <h2 className="font-serif text-2xl">Review Items</h2>
              </div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-foreground/5 bg-white">
                    <div className="relative w-16 h-20 flex-shrink-0 bg-muted">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category.name}</p>
                      <p className="text-xs mt-2">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 border border-foreground/5 sticky top-32">
              <h2 className="font-serif text-2xl mb-8">Payment Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bag Total</span>
                  <span className="font-medium">₹{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className={cn(
                    "font-medium",
                    deliveryEstimate?.deliveryCharge === 0 ? "text-green-600" : ""
                  )}>
                    {deliveryEstimate?.deliveryCharge === 0 ? "FREE" : `₹${deliveryEstimate?.deliveryCharge || 0}`}
                  </span>
                </div>
                
                <Separator className="bg-foreground/5 my-6" />
                
                <div className="flex justify-between text-xl font-serif">
                  <span>Total Amount</span>
                  <span className="text-primary font-bold text-2xl">₹{totalPayable.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Inclusive of all taxes</p>
              </div>

              <div className="mt-10 space-y-4">
                <Button 
                  onClick={handleCheckout}
                  disabled={loading || !scriptLoaded || !deliveryEstimate?.isAvailable}
                  className="w-full rounded-none py-8 bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-3" />
                      Pay & Place Order
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">100% Secure Transaction</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-foreground/5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Methods</p>
                <div className="flex flex-wrap gap-3 opacity-50 grayscale contrast-125">
                   {/* Placeholder for payment logos */}
                   <span className="text-xs border px-2 py-1">UPI</span>
                   <span className="text-xs border px-2 py-1">CARDS</span>
                   <span className="text-xs border px-2 py-1">NETBANKING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptLoaded(true)}
      />
    </div>
  );
}
