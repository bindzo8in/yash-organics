"use client";

import { useQuery } from "@tanstack/react-query";
import { CursorDataTable } from "@/components/admin/cursor-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerDetails } from "@/components/admin/customer-details";

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Pagination & Filtering state
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", currentCursor, dateRange],
    queryFn: async () => {
      let url = `/api/admin/customers?limit=10&dateRange=${dateRange}`;
      if (currentCursor) {
        url += `&cursor=${currentCursor}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch customers");
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

  const handleDateFilterChange = (value: string) => {
    setDateRange(value);
    setCurrentCursor(null);
    setCursorStack([]);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm text-muted-foreground">
          <span>{row.original.email}</span>
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Total Orders",
      cell: ({ row }) => <span className="font-medium">{row.original.totalOrders}</span>,
    },
    {
      accessorKey: "totalSpent",
      header: "Total Spent",
      cell: ({ row }) => <span className="font-medium text-emerald-600">₹{row.original.totalSpent}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSelectedCustomerId(row.original.id);
            setIsOpen(true);
          }}
        >
          <Eye className="h-4 w-4 mr-2" /> View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your registered customers and view their purchase history.</p>
        </div>
        
        <div className="w-[180px]">
          <Select value={dateRange} onValueChange={handleDateFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">Loading customers...</div>
      ) : (
        <CursorDataTable 
          columns={columns} 
          data={data?.customers || []} 
          onNext={handleNext}
          onPrev={handlePrev}
          hasNextPage={!!data?.nextCursor}
          hasPrevPage={cursorStack.length > 0}
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] bg-background max-h-[80vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-500/10 pb-4">
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomerId && (
            <CustomerDetails customerId={selectedCustomerId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
