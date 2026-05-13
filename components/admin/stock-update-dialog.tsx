"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Minus, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockUpdateDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function StockUpdateDialog({
  product,
  isOpen,
  onClose,
}: StockUpdateDialogProps) {
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState<Record<string, { quantity: number; reason: string; type: string }>>({});

  const mutation = useMutation({
    mutationFn: async (variantUpdates: any[]) => {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantUpdates }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update stock");
      }
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["stock-history", product.id] });
      toast.success("Stock updated successfully");
      onClose();
      setUpdates({});
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleUpdateChange = (variantId: string, field: string, value: any) => {
    setUpdates((prev) => ({
      ...prev,
      [variantId]: {
        ...(prev[variantId] || { quantity: 0, reason: "", type: "RESTOCK" }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const variantUpdates = Object.entries(updates)
      .filter(([_, data]) => data.quantity !== 0)
      .map(([variantId, data]) => ({
        variantId,
        quantity: data.quantity,
        reason: data.reason,
        type: data.type,
      }));

    if (variantUpdates.length === 0) {
      toast.error("Please enter a quantity change for at least one variant");
      return;
    }

    mutation.mutate(variantUpdates);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background border-t-4 border-t-emerald-600 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            Update Stock Levels
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{product?.name}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {product?.variants?.map((variant: any) => (
            <div key={variant.id} className="p-4 rounded-xl border border-border bg-secondary/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{variant.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Current: <span className="font-bold text-emerald-600">{variant.stock} Pcs</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none border-r"
                      onClick={() => handleUpdateChange(variant.id, "quantity", (updates[variant.id]?.quantity || 0) - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      className="h-8 w-16 border-0 focus-visible:ring-0 text-center font-bold text-sm bg-transparent"
                      value={updates[variant.id]?.quantity || 0}
                      onChange={(e) => handleUpdateChange(variant.id, "quantity", parseInt(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none border-l"
                      onClick={() => handleUpdateChange(variant.id, "quantity", (updates[variant.id]?.quantity || 0) + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {updates[variant.id]?.quantity !== 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</Label>
                    <Select 
                      value={updates[variant.id]?.type || "RESTOCK"} 
                      onValueChange={(val) => handleUpdateChange(variant.id, "type", val)}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" className="w-[--radix-select-trigger-width] bg-background">
                        <SelectItem value="RESTOCK">Restock (+)</SelectItem>
                        <SelectItem value="SALE">Sale (-)</SelectItem>
                        <SelectItem value="RETURN">Return (+)</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason</Label>
                    <Input 
                      className="h-8 text-xs" 
                      placeholder="e.g. Weekly refill"
                      value={updates[variant.id]?.reason || ""}
                      onChange={(e) => handleUpdateChange(variant.id, "reason", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {(variant.stock + (updates[variant.id]?.quantity || 0) < 0) && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-[10px] font-medium border border-red-100">
                  <AlertCircle className="h-3 w-3" />
                  Warning: Resulting stock will be negative. This update will fail.
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Updating..." : "Confirm Updates"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
