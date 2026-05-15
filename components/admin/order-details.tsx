"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Truck, PackageCheck, CreditCard, AlertCircle, RotateCcw, CheckCircle2 } from "lucide-react";
import { updateOrderStatus, type OrderActionState } from "@/lib/actions/orders";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { canRefundOrder } from "@/lib/utils/order-logic";
import { initiateRefund } from "@/lib/actions/refund.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [showRefundAlert, setShowRefundAlert] = useState(false);

  const initialState: OrderActionState = {
    success: false,
    message: "",
    errors: {},
  };

  const [state, formAction, isPending] = useActionState(
    updateOrderStatus.bind(null, order.id),
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onUpdate();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onUpdate]);

  const getErrors = (name: string) => {
    const serverErrors = state.errors?.[name];
    const errors: { message?: string }[] = [];
    if (Array.isArray(serverErrors)) {
      serverErrors.forEach(msg => errors.push({ message: msg }));
    } else if (serverErrors) {
      errors.push({ message: serverErrors as any });
    }
    return errors;
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
      <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <PackageCheck className="h-4 w-4" /> Items Ordered
          </h4>
          <div className="space-y-2">
            {order.orderItems.map((item: any) => (
              <div key={item.id} className="text-sm flex justify-between">
                <span>{item.productName || (item.product && item.product.name)} {item.variantName || (item.variant && item.variant.name) ? `(${item.variantName || item.variant.name})` : ""} x {item.quantity}</span>
                <span className="font-medium">₹{item.sellingPrice * item.quantity}</span>
              </div>
            ))}
            <div className="space-y-1 text-sm border-t border-primary/5 pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.totalAmount - (order.deliveryCharge || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charge</span>
                <span>₹{order.deliveryCharge || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-primary text-base pt-1">
                <span>Grand Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Payment: {order.paymentStatus}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Truck className="h-4 w-4" /> Shipping Address
          </h4>
          <div className="text-sm text-muted-foreground">
            <p>{order.address.fullName}</p>
            <p>{order.address.addressLine1}</p>
            <p>{order.address.city}, {order.address.state} - {order.address.postalCode}</p>
            <p>Phone: {order.address.phone}</p>
          </div>
        </div>
      </div>

      <Separator />

      <form action={formAction} className="space-y-4 bg-neutral-50 p-6 rounded-xl border border-neutral-200">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" /> Fulfillment & Status
        </h4>
        
        {order.paymentStatus === "PENDING" && order.orderStatus !== "CANCELLED" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs font-medium mb-4">
            Order is currently unpaid. Ensure payment is received before shipping.
          </div>
        )}

        {(order.cancelReason || order.returnReason) && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm mb-6 space-y-2">
            {order.cancelReason && (
              <div>
                <span className="font-bold uppercase text-[10px] tracking-wider block mb-1">Cancellation Reason</span>
                <p className="italic font-light">"{order.cancelReason}"</p>
              </div>
            )}
            {order.returnReason && (
              <div>
                <span className="font-bold uppercase text-[10px] tracking-wider block mb-1">Return Reason</span>
                <p className="italic font-light">"{order.returnReason}"</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Order Status</FieldLabel>
            <Select name="orderStatus" defaultValue={order.orderStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[--radix-select-trigger-width] bg-white border-neutral-200 shadow-xl">
                {order.paymentStatus === "PENDING" ? (
                  <>
                    <SelectItem value="PENDING">Pending Payment</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="RETURN_REQUESTED">Return Requested</SelectItem>
                    <SelectItem value="RETURN_APPROVED">Return Approved</SelectItem>
                    <SelectItem value="RETURN_REJECTED">Return Rejected</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <FieldError errors={getErrors("orderStatus")} />
          </Field>
          
          <Field>
            <FieldLabel>Payment Status</FieldLabel>
            <Select name="paymentStatus" defaultValue={order.paymentStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[--radix-select-trigger-width] bg-white border-neutral-200 shadow-xl">
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={getErrors("paymentStatus")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Courier Partner</FieldLabel>
            <Input 
              name="courierPartner"
              placeholder="e.g. BlueDart" 
              defaultValue={order.courierPartner || ""} 
              className="bg-white"
            />
            <FieldError errors={getErrors("courierPartner")} />
          </Field>
          <Field>
            <FieldLabel>Tracking ID</FieldLabel>
            <Input 
              name="trackingId"
              placeholder="Enter tracking number" 
              defaultValue={order.trackingId || ""} 
              className="bg-white"
            />
            <FieldError errors={getErrors("trackingId")} />
          </Field>
        </div>

        <Field>
          <FieldLabel>Tracking URL</FieldLabel>
          <Input 
            name="trackingUrl"
            placeholder="Direct link to tracking page" 
            defaultValue={order.trackingUrl || ""} 
            className="bg-white"
          />
          <FieldError errors={getErrors("trackingUrl")} />
        </Field>

        <Field>
          <FieldLabel>Admin Note</FieldLabel>
          <Textarea 
            name="adminNote"
            placeholder="Internal notes for this order..." 
            defaultValue={order.adminNote || ""} 
            className="bg-white min-h-[80px]"
          />
          <FieldError errors={getErrors("adminNote")} />
        </Field>
        
        <Button 
          type="submit"
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
          disabled={isPending}
        >
          {isPending ? "Updating Order..." : "Save Order Changes"}
        </Button>
      </form>

      {/* Refund Management Section */}
      {canRefundOrder(order) && (
        <div className="mt-8 bg-white p-6 rounded-2xl border border-primary/10 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
               <RotateCcw className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-xl text-primary">Refund Eligibility</h4>
              <p className="text-sm text-muted-foreground font-light">
                This order is qualified for a full reversal of <span className="font-bold text-red-600">₹{order.totalAmount}</span>.
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Admin Action Required</p>
            <Button 
              onClick={() => setShowRefundAlert(true)}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-12 rounded-xl text-xs uppercase tracking-[0.2em] font-bold shadow-sm transition-all"
              disabled={isRefunding}
            >
              {isRefunding ? "Processing Transaction..." : "Initiate Secure Refund"}
            </Button>
          </div>

          <AlertDialog open={showRefundAlert} onOpenChange={setShowRefundAlert}>
            <AlertDialogContent className="bg-white border-red-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-2xl text-red-900">Initiate Full Refund?</AlertDialogTitle>
                <AlertDialogDescription className="text-red-700/80 font-light py-4">
                  This will initiate a refund of <span className="font-bold">₹{order.totalAmount}</span> via Razorpay. This action is permanent and cannot be reversed.
                  <div className="mt-4 space-y-2">
                    <FieldLabel className="text-red-900 font-bold text-xs uppercase tracking-wider">Refund Reason</FieldLabel>
                    <Textarea 
                      placeholder="e.g. Out of stock, Customer requested cancellation..." 
                      className="bg-white border-red-100 focus-visible:ring-red-200"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full text-xs uppercase tracking-widest h-10 px-6">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!refundReason.trim()) {
                      toast.error("Please provide a reason for the refund.");
                      return;
                    }
                    setIsRefunding(true);
                    const result = await initiateRefund(order.id, refundReason);
                    setIsRefunding(false);
                    if (result.success) {
                      toast.success(result.message);
                      setShowRefundAlert(false);
                      onUpdate();
                    } else {
                      toast.error(result.message);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full text-xs uppercase tracking-widest h-10 px-6"
                >
                  Confirm Refund
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {order.orderStatus === "REFUNDED" && (
        <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-serif text-lg text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Refund Completed
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Refund ID</p>
              <p className="font-mono text-xs">{order.refundTransactionId}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Refunded On</p>
              <p className="font-medium text-xs">
                {order.refundedAt ? new Date(order.refundedAt).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
