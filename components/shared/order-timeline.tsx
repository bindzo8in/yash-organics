"use client";

import { CheckCircle2, Clock, Package, Truck, ShoppingCart, AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OrderTimelineProps {
  order: {
    orderStatus: string;
    createdAt: Date | string;
    confirmedAt?: Date | string | null;
    processingAt?: Date | string | null;
    shippedAt?: Date | string | null;
    deliveredAt?: Date | string | null;
    cancelledAt?: Date | string | null;
    returnRequestedAt?: Date | string | null;
    returnApprovedAt?: Date | string | null;
    returnedAt?: Date | string | null;
    refundedAt?: Date | string | null;
  };
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const baseSteps = [
    {
      id: "ordered",
      label: "Ordered",
      date: order.createdAt,
      icon: ShoppingCart,
      isCompleted: true,
    },
    {
      id: "confirmed",
      label: "Order Confirmed",
      date: order.confirmedAt,
      icon: CheckCircle2,
      isCompleted: !!order.confirmedAt || ["PROCESSING", "SHIPPED", "DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURNED", "REFUNDED"].includes(order.orderStatus),
    },
    {
      id: "processing",
      label: "Order Ready",
      date: order.processingAt,
      icon: Package,
      isCompleted: !!order.processingAt || ["SHIPPED", "DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURNED", "REFUNDED"].includes(order.orderStatus),
    },
    {
      id: "shipped",
      label: "Shipped",
      date: order.shippedAt,
      icon: Truck,
      isCompleted: !!order.shippedAt || ["DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURNED", "REFUNDED"].includes(order.orderStatus),
    },
    {
      id: "delivered",
      label: "Delivered",
      date: order.deliveredAt,
      icon: Package,
      isCompleted: !!order.deliveredAt || ["RETURN_REQUESTED", "RETURN_APPROVED", "RETURNED", "REFUNDED"].includes(order.orderStatus),
    },
  ];

  const returnSteps = order.returnRequestedAt ? [
    {
      id: "return_requested",
      label: "Return Requested",
      date: order.returnRequestedAt,
      icon: RotateCcw,
      isCompleted: true,
    },
    {
      id: "return_approved",
      label: "Return Approved",
      date: order.returnApprovedAt,
      icon: CheckCircle2,
      isCompleted: !!order.returnApprovedAt || ["RETURNED", "REFUNDED"].includes(order.orderStatus),
    },
    {
      id: "returned",
      label: "Returned",
      date: order.returnedAt,
      icon: Package,
      isCompleted: !!order.returnedAt || order.orderStatus === "REFUNDED",
    },
    {
      id: "refunded",
      label: "Refunded",
      date: order.refundedAt,
      icon: ShoppingCart,
      isCompleted: order.orderStatus === "REFUNDED",
    }
  ] : [];

  const steps = [...baseSteps, ...returnSteps];

  // If cancelled, show a different view
  if (order.orderStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <div>
          <p className="font-bold text-sm">Order Cancelled</p>
          {order.cancelledAt && (
            <p className="text-xs opacity-80">{format(new Date(order.cancelledAt), "MMM d, yyyy")}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/20 before:to-transparent">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <div key={`${step.id}-${index}`} className="relative flex items-start gap-6 group">
            {/* Circle & Checkmark */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 transition-all duration-500",
              step.isCompleted 
                ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                : "bg-white border-neutral-200 text-neutral-400"
            )}>
              {step.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>

            {/* Content Container */}
            <div className="flex flex-1 items-center gap-4 pb-2">
               {/* Icon Circle */}
               <div className={cn(
                 "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500",
                 step.isCompleted ? "bg-white border-primary/20 shadow-sm" : "bg-neutral-50 border-neutral-100 opacity-50"
               )}>
                 <Icon className={cn("w-5 h-5", step.isCompleted ? "text-primary" : "text-neutral-400")} />
               </div>

               {/* Text */}
               <div className="flex-1">
                 <p className={cn(
                   "font-bold text-sm tracking-tight transition-colors",
                   step.isCompleted ? "text-primary" : "text-neutral-400"
                 )}>
                   {step.label}
                 </p>
                 {step.isCompleted && step.date && (
                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                     {format(new Date(step.date), "MMM d, h:mm a")}
                   </p>
                 )}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
