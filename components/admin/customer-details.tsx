"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CustomerDetailsProps {
  customerId: string;
}

const statusMap: Record<string, any> = {
  PENDING: { color: "bg-amber-100 text-amber-800", label: "Pending" },
  CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  PROCESSING: { color: "bg-indigo-100 text-indigo-800", label: "Processing" },
  SHIPPED: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
  DELIVERED: { color: "bg-emerald-100 text-emerald-800", label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
};

export function CustomerDetails({ customerId }: CustomerDetailsProps) {
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-orders", customerId, currentCursor],
    queryFn: async () => {
      let url = `/api/admin/customers/${customerId}/orders?limit=5`;
      if (currentCursor) {
        url += `&cursor=${currentCursor}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch customer orders");
      return res.json();
    },
  });

  const handleNext = () => {
    if (data?.nextCursor) {
      setCursorStack((prev) => [...prev, currentCursor || ""]);
      setCurrentCursor(data.nextCursor);
    }
  };

  const handlePrev = () => {
    if (cursorStack.length > 0) {
      const newStack = [...cursorStack];
      const prevCursor = newStack.pop();
      setCursorStack(newStack);
      setCurrentCursor(prevCursor === "" ? null : prevCursor || null);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" /> Order History
        </h3>
        
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Loading order history...</div>
        ) : data?.orders?.length > 0 ? (
          <div className="space-y-4">
            {data.orders.map((order: any) => {
              const statusConfig = statusMap[order.orderStatus] || statusMap.PENDING;
              return (
                <div key={order.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground mb-1">
                        ID: {order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="font-medium text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="font-bold">₹{order.totalAmount}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={order.paymentStatus === 'PAID' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
                          {order.paymentStatus}
                        </Badge>
                        <Badge className={`${statusConfig.color} border-none shadow-none`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="space-y-1">
                    {order.orderItems.map((item: any) => (
                      <div key={item.id} className="text-xs flex justify-between text-muted-foreground">
                        <span>{item.quantity}x {item.productName || 'Product'} {item.variantName ? `(${item.variantName})` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-muted-foreground">Showing up to 5 orders per page</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={cursorStack.length === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!data?.nextCursor}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm border rounded-lg border-dashed">
            No orders found for this customer.
          </div>
        )}
      </div>
    </div>
  );
}
