"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, AlertCircle, RotateCcw, CreditCard, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "./order-timeline";
import { cn } from "@/lib/utils";
import { canCancelOrder, canReturnOrder } from "@/lib/utils/order-logic";
import { cancelOrder, requestReturn } from "@/lib/actions/order-lifecycle.actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface OrderCardProps {
  order: any;
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const canCancel = canCancelOrder(order);
  const canReturn = canReturnOrder(order);

  const handleCancel = async (reason: string) => {
    setIsSubmitting(true);
    const result = await cancelOrder(order.id, reason);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      setShowCancelDialog(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleReturn = async (reason: string) => {
    setIsSubmitting(true);
    const result = await requestReturn(order.id, reason);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      setShowReturnDialog(false);
    } else {
      toast.error(result.message);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { icon: <Clock className="w-4 h-4" />, color: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" };
      case 'CONFIRMED': return { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Confirmed" };
      case 'PROCESSING': return { icon: <RotateCcw className="w-4 h-4" />, color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Processing" };
      case 'SHIPPED': return { icon: <Truck className="w-4 h-4" />, color: "bg-purple-50 text-purple-700 border-purple-200", label: "Shipped" };
      case 'DELIVERED': return { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-green-50 text-green-700 border-green-200", label: "Delivered" };
      case 'CANCELLED': return { icon: <AlertCircle className="w-4 h-4" />, color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" };
      case 'RETURN_REQUESTED': return { icon: <RotateCcw className="w-4 h-4" />, color: "bg-orange-50 text-orange-700 border-orange-200", label: "Return Requested" };
      case 'RETURN_APPROVED': return { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-green-50 text-green-700 border-green-200", label: "Return Approved" };
      case 'RETURN_REJECTED': return { icon: <AlertCircle className="w-4 h-4" />, color: "bg-red-50 text-red-700 border-red-200", label: "Return Rejected" };
      case 'RETURNED': return { icon: <RotateCcw className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Returned" };
      case 'REFUNDED': return { icon: <CreditCard className="w-4 h-4" />, color: "bg-slate-50 text-slate-700 border-slate-200", label: "Refunded" };
      default: return { icon: <Clock className="w-4 h-4" />, color: "bg-neutral-50 text-neutral-700 border-neutral-200", label: status };
    }
  };

  const status = getStatusConfig(order.orderStatus);

  return (
    <div className="group bg-white border border-primary/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="bg-neutral-50/50 px-6 py-6 md:px-8 border-b border-primary/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1.5">Order Identity</p>
            <p className="text-sm font-mono font-medium text-primary uppercase">#{order.id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1.5">Date Placed</p>
            <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1.5">Grand Total</p>
            <p className="text-sm font-bold text-primary">₹{order.totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <Badge className={`${status.color} px-3 py-1 rounded-full border flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase shadow-none`}>
          {status.icon}
          {status.label}
        </Badge>
      </div>

      {/* Items */}
      <div className="p-6 md:p-8 space-y-6">
        {order.orderItems.map((item: any) => (
          <div key={item.id} className="flex items-center gap-6 group/item">
            <div className="w-20 h-20 bg-[#FDFBF7] relative rounded-xl overflow-hidden border border-primary/5 flex-shrink-0 group-hover/item:border-primary/20 transition-colors">
               {item.productImage || (item.product && item.product.productImages && item.product.productImages[0]?.url) ? (
                 <img 
                    src={item.productImage || item.product.productImages[0]?.url} 
                    alt={item.productName || (item.product && item.product.name)} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" 
                 />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground tracking-widest uppercase">No Image</div>
               )}
            </div>
            <div className="flex-1 space-y-1">
              <Link 
                href={item.product ? `/product/${item.product.slug}` : "#"} 
                className={cn(
                  "font-serif text-lg text-primary hover:text-primary/70 transition-colors",
                  !item.product && "pointer-events-none"
                )}
              >
                {item.productName || (item.product && item.product.name)}
              </Link>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-light tracking-wide">
                <span>Qty: {item.quantity}</span>
                <span className="w-1 h-1 bg-primary/20 rounded-full"></span>
                <span>Variant: {item.variantName || (item.variant && item.variant.name)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">₹{(item.sellingPrice * item.quantity).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground font-medium">₹{item.sellingPrice} / unit</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Expansion */}
      {isExpanded && (
        <div className="px-6 py-10 md:px-12 bg-neutral-50/30 border-t border-primary/5 animate-in slide-in-from-top-2 duration-500">
           <div className="max-w-md">
             <h4 className="font-serif text-xl text-primary mb-8">Delivery Progress</h4>
             <OrderTimeline order={order} />
           </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="px-6 py-4 md:px-8 bg-[#FDFBF7]/30 border-t border-primary/5 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline" 
            size="sm" 
            className="text-[10px] uppercase tracking-[0.1em] font-bold rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 transition-all gap-2"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isExpanded && "rotate-180")} />
            {isExpanded ? "Hide Tracking" : "Track Order"}
          </Button>

          {order.trackingUrl && (
            <Button asChild variant="outline" size="sm" className="text-[10px] uppercase tracking-[0.1em] font-bold rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 transition-all gap-2">
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
                Courier Tracking
              </a>
            </Button>
          )}

          {canCancel && (
            <Button 
              onClick={() => setShowCancelDialog(true)}
              variant="outline" 
              size="sm" 
              className="text-[10px] uppercase tracking-[0.1em] font-bold rounded-full border-red-200 text-red-600 hover:bg-red-50 transition-all gap-2"
            >
              <AlertCircle className="w-3 h-3" />
              Cancel Order
            </Button>
          )}

          {canReturn && (
            <Button 
              onClick={() => setShowReturnDialog(true)}
              variant="outline" 
              size="sm" 
              className="text-[10px] uppercase tracking-[0.1em] font-bold rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 transition-all gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Return Order
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
           {order.trackingId && !isExpanded && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Truck className="w-3 h-3" />
                <span>Tracking: {order.trackingId}</span>
              </div>
           )}
           <Link href={`/order-status/${order.id}`}>
             <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-[0.1em] font-bold text-muted-foreground hover:text-primary">
               Order Details
             </Button>
           </Link>
        </div>
      </div>

      {/* Action Dialogs */}
      <OrderActionDialog 
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel Order"
        description="Please provide a reason for cancelling your order. This helps us improve our service."
        placeholder="Reason for cancellation..."
        actionLabel="Cancel Order"
        onConfirm={(reason) => handleCancel(reason)}
        isLoading={isSubmitting}
      />

      <OrderActionDialog 
        isOpen={showReturnDialog}
        onClose={() => setShowReturnDialog(false)}
        title="Return Order"
        description="Please provide a reason for returning this order. Our team will review your request."
        placeholder="Reason for return..."
        actionLabel="Request Return"
        onConfirm={(reason) => handleReturn(reason)}
        isLoading={isSubmitting}
      />
    </div>
  );
}

interface OrderActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  placeholder: string;
  actionLabel: string;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

function OrderActionDialog({ 
  isOpen, onClose, title, description, placeholder, actionLabel, onConfirm, isLoading 
}: OrderActionDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-primary/10">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground font-light italic">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] border-primary/10 focus-visible:ring-primary/20"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-xs uppercase tracking-widest">
            Close
          </Button>
          <Button 
            onClick={() => onConfirm(reason)} 
            disabled={isLoading || !reason.trim()}
            className="bg-primary hover:bg-primary/90 text-white px-6 rounded-full text-xs uppercase tracking-widest h-10"
          >
            {isLoading ? "Processing..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
