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
import { Truck, PackageCheck, CreditCard } from "lucide-react";
import { updateOrderStatus, type OrderActionState } from "@/lib/actions/orders";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
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
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <PackageCheck className="h-4 w-4" /> Items Ordered
          </h4>
          <div className="space-y-2">
            {order.orderItems.map((item: any) => (
              <div key={item.id} className="text-sm flex justify-between">
                <span>{item.product.name} {item.variant ? `(${item.variant.name})` : ""} x {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold pt-2">
              <span>Total Amount</span>
              <span>₹{order.totalAmount}</span>
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

      <form action={formAction} className="space-y-4 bg-neutral-50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm">Fulfillment & Tracking</h4>
        
        {order.paymentStatus === "PENDING" && order.orderStatus !== "CANCELLED" && (
          <div className="bg-amber-100 text-amber-800 p-3 rounded-md text-xs font-medium mb-4">
            This order is unpaid. Fulfillment options are disabled until payment is successful.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Order Status</FieldLabel>
            <Select name="orderStatus" defaultValue={order.orderStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[--radix-select-trigger-width] bg-secondary">
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
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <FieldError errors={getErrors("orderStatus")} />
          </Field>
          <Field>
            <FieldLabel>Courier Partner</FieldLabel>
            <Input 
              name="courierPartner"
              placeholder="e.g. BlueDart" 
              defaultValue={order.courierPartner || ""} 
              disabled={order.paymentStatus === "PENDING"}
            />
            <FieldError errors={getErrors("courierPartner")} />
          </Field>
        </div>
        <Field>
          <FieldLabel>Tracking ID</FieldLabel>
          <Input 
            name="trackingId"
            placeholder="Enter tracking number" 
            defaultValue={order.trackingId || ""} 
            disabled={order.paymentStatus === "PENDING"}
          />
          <FieldError errors={getErrors("trackingId")} />
        </Field>
        <Button 
          type="submit"
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
