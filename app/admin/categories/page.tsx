"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { CategoryForm } from "@/components/admin/category-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/cloudinary-utils";

export default function CategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = row.original.image;
        if (!image) return <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center text-[10px] text-muted-foreground uppercase font-bold">No Img</div>;
        const src = getImageUrl(image);
        return (
          <div className="w-10 h-10 rounded-lg overflow-hidden border bg-secondary/20">
            <img 
              src={src} 
              alt={row.original.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        );
      }
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name}
          {!row.original.parentId && <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Parent</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "parent.name",
      header: "Parent Category",
      cell: ({ row }) => row.original.parent?.name || "-",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setSelectedCategory(category);
                setIsOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500"
              onClick={() => {
                if (confirm("Are you sure?")) {
                  deleteMutation.mutate(category.id);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage your organic product categories.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSelectedCategory(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-t-4 border-t-emerald-600 shadow-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              key={selectedCategory?.id || "new-category"}
              initialData={selectedCategory} 
              onSuccess={() => {
                setIsOpen(false);
                queryClient.invalidateQueries({ queryKey: ["categories"] });
              }} 
              categories={categories?.filter((c: any) => !c.parentId) || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">Loading...</div>
      ) : (
        <DataTable columns={columns} data={categories || []} searchKey="name" />
      )}
    </div>
  );
}
