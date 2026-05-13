"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Check, Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAddresses, createAddress, deleteAddress, updateAddress, AddressInput } from "@/lib/actions/address.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddressManagerProps {
  onSelect?: (addressId: string) => void;
  selectedId?: string;
  isSelectionMode?: boolean;
}

export function AddressManager({ onSelect, selectedId, isSelectionMode = false }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
      if (isSelectionMode && data.length > 0 && !selectedId) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        onSelect?.(defaultAddr.id);
      }
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      toast.success("Address deleted");
      loadAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card
            key={address.id}
            onClick={() => isSelectionMode && onSelect?.(address.id)}
            className={cn(
              "relative p-5 cursor-pointer transition-all border-foreground/5 hover:border-primary/50",
              isSelectionMode && selectedId === address.id && "ring-2 ring-primary border-primary bg-primary/5"
            )}
          >
            <div className="flex justify-between mb-2">
              <span className="font-medium text-sm">{address.fullName}</span>
              {address.isDefault && (
                <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>{address.city}, {address.state} - {address.postalCode}</p>
              <p>Phone: {address.phone}</p>
            </div>

            {!isSelectionMode && (
              <div className="mt-4 pt-4 border-t border-foreground/5 flex gap-4">
                <button 
                  onClick={() => {
                    setEditingAddress(address);
                    setIsAdding(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}

            {isSelectionMode && selectedId === address.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                <Check className="w-3 h-3" />
              </div>
            )}
          </Card>
        ))}

        <button
          onClick={() => {
            setEditingAddress(null);
            setIsAdding(true);
          }}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-foreground/10 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">Add New Address</span>
        </button>
      </div>
      
      {/* Address Form Modal/Overlay would go here - for brevity I'll keep it simple */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-none border-none">
             <div className="flex justify-between items-center mb-8">
               <h2 className="font-serif text-2xl text-primary">{editingAddress ? "Edit Address" : "Add New Address"}</h2>
               <button onClick={() => {
                 setIsAdding(false);
                 setEditingAddress(null);
               }} className="text-muted-foreground hover:text-primary">
                 <Trash2 className="w-5 h-5 rotate-45" /> {/* Close icon substitute */}
               </button>
             </div>
             <form action={async (formData) => {
                const data = {
                  fullName: formData.get("fullName") as string,
                  phone: formData.get("phone") as string,
                  email: formData.get("email") as string,
                  addressLine1: formData.get("addressLine1") as string,
                  addressLine2: (formData.get("addressLine2") as string) || "",
                  city: formData.get("city") as string,
                  state: formData.get("state") as string,
                  country: (formData.get("country") as string) || "India",
                  postalCode: formData.get("postalCode") as string,
                  isDefault: formData.get("isDefault") === "on",
                };

                try {
                  const result = editingAddress 
                    ? await updateAddress(editingAddress.id, data)
                    : await createAddress(data);

                  if (result?.success) {
                    toast.success(editingAddress ? "Address updated" : "Address added successfully");
                    setIsAdding(false);
                    setEditingAddress(null);
                    loadAddresses();
                  } else {
                    toast.error("Failed to save address");
                  }
                } catch (e: any) {
                  toast.error(e.message || "An unexpected error occurred");
                }
             }} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name</label>
                   <input name="fullName" defaultValue={editingAddress?.fullName} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Phone</label>
                   <input name="phone" defaultValue={editingAddress?.phone} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
                 </div>
               </div>
               
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email Address</label>
                 <input name="email" type="email" defaultValue={editingAddress?.email} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Street Address</label>
                 <input name="addressLine1" defaultValue={editingAddress?.addressLine1} required placeholder="House No, Building, Street" className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Apartment, suite, etc. (optional)</label>
                 <input name="addressLine2" defaultValue={editingAddress?.addressLine2} className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">City</label>
                   <input name="city" defaultValue={editingAddress?.city} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">State</label>
                   <input name="state" defaultValue={editingAddress?.state} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Pincode</label>
                   <input name="postalCode" defaultValue={editingAddress?.postalCode} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Country</label>
                   <input name="country" defaultValue={editingAddress?.country || "India"} required className="w-full p-3 border border-border bg-muted/20 text-sm focus:outline-none focus:border-primary transition-colors" />
                 </div>
               </div>

               <div className="flex items-center gap-3 py-2">
                 <input type="checkbox" name="isDefault" id="isDefault" defaultChecked={editingAddress?.isDefault} className="w-4 h-4 accent-primary" />
                 <label htmlFor="isDefault" className="text-xs font-medium cursor-pointer">Set as default delivery address</label>
               </div>

               <div className="flex gap-4 pt-6">
                 <Button type="button" variant="outline" onClick={() => {
                   setIsAdding(false);
                   setEditingAddress(null);
                 }} className="flex-1 rounded-none py-6 border-foreground/20">Cancel</Button>
                 <Button type="submit" className="flex-1 rounded-none py-6 bg-primary hover:bg-primary/90 text-white">
                   {editingAddress ? "Update Address" : "Save Address"}
                 </Button>
               </div>
             </form>
          </Card>
        </div>
      )}
    </div>
  );
}
