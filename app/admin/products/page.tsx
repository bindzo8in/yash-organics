"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, AlertTriangle, CheckCircle, XCircle, History } from "lucide-react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/product-form";
import { StockHistoryDialog } from "@/components/admin/stock-history-dialog";
import { StockUpdateDialog } from "@/components/admin/stock-update-dialog";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary-utils";
import { Package } from "lucide-react";

// Stock Status Component for cleaner logic
function StockStatus({ product }: { product: any }) {
  const variants = product.variants || [];
  const totalStock = variants.reduce((acc: number, v: any) => acc + v.stock, 0);

  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 10;

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="flex items-center gap-2 mb-1">
        <Badge 
          className={cn(
            "px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider",
            isOutOfStock && "bg-red-50 text-red-700 border-red-200",
            isLowStock && "bg-amber-50 text-amber-700 border-amber-200",
            !isOutOfStock && !isLowStock && "bg-emerald-50 text-emerald-700 border-emerald-200"
          )}
          variant="outline"
        >
          {isOutOfStock ? "Out of Stock" : totalStock + " " + "Pcs"}
        </Badge>
      </div>
      <div className="space-y-0.5">
        {variants.map((v: any) => (
          <div key={v.id} className="flex items-center gap-2 text-[10px] leading-tight group">
            <span className="text-muted-foreground font-medium min-w-[40px]">{v.name}</span>
            <span className="text-muted-foreground/30">—</span>
            <span className={cn(
              "font-bold tabular-nums",
              v.stock === 0 ? "text-red-600" : v.stock <= (v.lowStockLevel || 5) ? "text-amber-600" : "text-emerald-600"
            )}>
              {v.stock} x {v.weight} {v.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [historyProductName, setHistoryProductName] = useState<string>("");
  const [stockUpdateProduct, setStockUpdateProduct] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["stock-history"] });
      toast.success("Product deleted successfully");
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        const mainImage = product.productImages?.find((img: any) => img.isPrimary)?.url || product.productImages?.[0]?.url;
        
        return (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-secondary/20 overflow-hidden border border-border shadow-sm flex-shrink-0">
              {mainImage ? (
                <img 
                  src={getImageUrl(mainImage)} 
                  alt={product.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-secondary/40">
                  <Package className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none mb-1">{product.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                {product.category?.name} • {product.slug}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Inventory Status",
      cell: ({ row }) => <StockStatus product={row.original} />,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const product = row.original;
        const variants = product.variants || [];
        
        if (variants.length === 0) return <span className="text-sm text-muted-foreground italic">N/A</span>;

        const prices = variants.map((v: any) => v.sellingPrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) {
          return <span className="font-medium text-sm">₹{min}</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">₹{min} - ₹{max}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
              title="Quick Stock Update"
              onClick={() => {
                setStockUpdateProduct(product);
              }}
            >
              <Package className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
              title="View History"
              onClick={() => {
                setHistoryProductId(product.id);
                setHistoryProductName(product.name);
              }}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => {
                setSelectedProduct(product);
                setIsOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                if (confirm("Permanently delete this product? This action cannot be undone.")) {
                  deleteMutation.mutate(product.id);
                }
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between bg-white p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-serif tracking-tight">Inventory</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor stock levels, manage variants, and track product availability.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSelectedProduct(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 font-bold shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto bg-background border-t-4 border-t-emerald-600 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                {selectedProduct ? "Edit Product Details" : "Create New Inventory Item"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm 
              key={selectedProduct?.id || "new-product"}
              initialData={selectedProduct} 
              onSuccess={async () => {
                setIsOpen(false);
                await queryClient.invalidateQueries({ queryKey: ["products"] });
                await queryClient.invalidateQueries({ queryKey: ["stock-history"] });
              }} 
              categories={categories || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing Inventory...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={products || []} searchKey="name" />
        )}
      </div>

      <StockHistoryDialog 
        productId={historyProductId}
        productName={historyProductName}
        isOpen={!!historyProductId}
        onClose={() => setHistoryProductId(null)}
      />

      <StockUpdateDialog 
        product={stockUpdateProduct}
        isOpen={!!stockUpdateProduct}
        onClose={() => setStockUpdateProduct(null)}
      />
    </div>
  );
}
