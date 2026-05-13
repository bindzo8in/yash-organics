"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { format } from "date-fns";

interface StockHistoryDialogProps {
  productId: string | null;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StockHistoryDialog({
  productId,
  productName,
  isOpen,
  onClose,
}:StockHistoryDialogProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["stock-history", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/stock-history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!productId && isOpen,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-background border-t-4 border-t-emerald-600 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-600" />
            Stock Transaction History
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </DialogHeader>

        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground animate-pulse">
              Loading transactions...
            </div>
          ) : transactions?.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No transactions recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((tx: any) => (
                  <TableRow key={tx.id} className="group">
                    <TableCell className="text-xs font-medium">
                      {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-bold">
                        {tx.quantity > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className={tx.quantity > 0 ? "text-emerald-700" : "text-red-700"}>
                          {tx.quantity > 0 ? "+" : ""}{tx.quantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {tx.variant?.name || <span className="text-muted-foreground italic">Base Product</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tx.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
