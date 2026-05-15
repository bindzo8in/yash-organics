"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Truck } from "lucide-react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { OrderDetails } from "@/components/admin/order-details";

const statusMap: Record<string, any> = {
  PENDING: { color: "bg-amber-100 text-amber-800", label: "Pending" },
  CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  PROCESSING: { color: "bg-indigo-100 text-indigo-800", label: "Processing" },
  SHIPPED: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
  DELIVERED: { color: "bg-emerald-100 text-emerald-800", label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  RETURN_REQUESTED: { color: "bg-orange-100 text-orange-800", label: "Return Requested" },
  RETURN_APPROVED: { color: "bg-blue-100 text-blue-800", label: "Return Approved" },
  RETURN_REJECTED: { color: "bg-red-100 text-red-800", label: "Return Rejected" },
  RETURNED: { color: "bg-emerald-100 text-emerald-800", label: "Returned" },
  REFUNDED: { color: "bg-slate-100 text-slate-800", label: "Refunded" },
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => <span className="font-mono text-xs uppercase">{row.original.id.slice(-8)}</span>,
    },
    {
      id: "customer",
      accessorKey: "user.name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.user.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => `₹${row.original.totalAmount}`,
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.orderStatus;
        const config = statusMap[status] || { color: "bg-neutral-100", label: status };
        return (
          <Badge className={`${config.color} border-none shadow-none`}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSelectedOrder(row.original);
            setIsOpen(true);
          }}
        >
          <Eye className="h-4 w-4 mr-2" /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Monitor and fulfill organic product orders.</p>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">Loading...</div>
      ) : (
        <DataTable columns={columns} data={orders || []} searchKey="customer" />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-hidden bg-background flex flex-col">
          <DialogHeader className="border-b border-gray-500/10">
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onUpdate={() => {
                setIsOpen(false);
                queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
