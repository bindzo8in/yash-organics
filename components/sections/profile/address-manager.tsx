"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Plus,
  Check,
  Trash2,
  Edit2,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";

import {
  getAddresses,
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/lib/actions/address.actions";

import { addressSchema } from "@/lib/validators/address.schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddressManagerProps {
  onSelect?: (addressId: string) => void;
  onAddressesChange?: (addresses: any[]) => void;
  selectedId?: string;
  isSelectionMode?: boolean;
}

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressManager({
  onSelect,
  onAddressesChange,
  selectedId,
  isSelectionMode = false,
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      isDefault: false,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();

      setAddresses(data);
      onAddressesChange?.(data);

      if (isSelectionMode && data.length > 0 && !selectedId) {
        const defaultAddr =
          data.find((address) => address.isDefault) || data[0];

        onSelect?.(defaultAddr.id);
      }
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await deleteAddress(id);

      toast.success("Address deleted");

      await loadAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const openAddForm = () => {
    setEditingAddress(null);

    reset({
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      isDefault: false,
    });

    setIsAdding(true);
  };

  const openEditForm = (address: any) => {
    setEditingAddress(address);

    reset({
      fullName: address.fullName ?? "",
      phone: address.phone ?? "",
      email: address.email ?? "",
      addressLine1: address.addressLine1 ?? "",
      addressLine2: address.addressLine2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      country: address.country ?? "India",
      postalCode: address.postalCode ?? "",
      isDefault: Boolean(address.isDefault),
    });

    setIsAdding(true);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingAddress(null);

    reset({
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      isDefault: false,
    });
  };

  const onSubmit = async (data: AddressFormValues) => {
    try {
      if (editingAddress) {
        const result = await updateAddress(
          editingAddress.id,
          data
        );

        if (!result.success) {
          toast.error("Failed to update address");
          return;
        }

        toast.success("Address updated");
      } else {
        const result = await createAddress(data);

        if (!result.success) {
          toast.error("Failed to save address");
          return;
        }

        toast.success("Address added successfully");

        if (result.address?.id) {
          onSelect?.(result.address.id);
        }
      }

      closeForm();

      await loadAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================
          ADDRESS LIST
      ============================================================ */}

      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card
            key={address.id}
            onClick={() =>
              isSelectionMode &&
              onSelect?.(address.id)
            }
            className={cn(
              "relative p-5 cursor-pointer transition-all border-foreground/5 hover:border-primary/50",
              isSelectionMode &&
                selectedId === address.id &&
                "ring-2 ring-primary border-primary bg-primary/5"
            )}
          >
            <div className="flex justify-between mb-2">
              <span className="font-medium text-sm">
                {address.fullName}
              </span>

              {address.isDefault && (
                <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>{address.addressLine1}</p>

              {address.addressLine2 && (
                <p>{address.addressLine2}</p>
              )}

              <p>
                {address.city}, {address.state} -{" "}
                {address.postalCode}
              </p>

              <p>Phone: {address.phone}</p>
            </div>

            {!isSelectionMode && (
              <div className="mt-4 pt-4 border-t border-foreground/5 flex gap-4">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditForm(address);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(address.id);
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}

            {isSelectionMode &&
              selectedId === address.id && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </div>
              )}
          </Card>
        ))}

        {/* Add Address */}
        <button
          type="button"
          onClick={openAddForm}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-foreground/10 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </div>

          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
            Add New Address
          </span>
        </button>
      </div>

      {/* ============================================================
          ADDRESS FORM MODAL
      ============================================================ */}

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 bg-white shadow-2xl rounded-none border-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl text-primary">
                {editingAddress
                  ? "Edit Address"
                  : "Add New Address"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ======================================================
                FORM
            ====================================================== */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* ====================================================
                  FULL NAME + PHONE
              ==================================================== */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="fullName"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                      >
                        Full Name
                      </label>

                      <Input
                        id="fullName"
                        placeholder="Enter full name"
                        {...field}
                        aria-invalid={!!errors.fullName}
                      />

                      {errors.fullName && (
                        <p className="text-sm text-destructive">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Phone */}
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="phone"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                      >
                        Phone
                      </label>

                      <PhoneInput
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-invalid={!!errors.phone}
                      />

                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* ====================================================
                  EMAIL
              ==================================================== */}

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                    >
                      Email Address
                    </label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      aria-invalid={!!errors.email}
                    />

                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* ====================================================
                  ADDRESS LINE 1
              ==================================================== */}

              <Controller
                name="addressLine1"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="addressLine1"
                      className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                    >
                      Street Address
                    </label>

                    <Input
                      id="addressLine1"
                      placeholder="House No, Building, Street"
                      {...field}
                      aria-invalid={!!errors.addressLine1}
                    />

                    {errors.addressLine1 && (
                      <p className="text-sm text-destructive">
                        {errors.addressLine1.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* ====================================================
                  ADDRESS LINE 2
              ==================================================== */}

              <Controller
                name="addressLine2"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="addressLine2"
                      className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                    >
                      Apartment, suite, etc.{" "}
                      <span className="font-normal normal-case tracking-normal">
                        (optional)
                      </span>
                    </label>

                    <Input
                      id="addressLine2"
                      placeholder="Apartment, suite, etc."
                      {...field}
                      aria-invalid={!!errors.addressLine2}
                    />

                    {errors.addressLine2 && (
                      <p className="text-sm text-destructive">
                        {errors.addressLine2.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* ====================================================
                  CITY + STATE
              ==================================================== */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="city"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                      >
                        City
                      </label>

                      <Input
                        id="city"
                        placeholder="City"
                        {...field}
                        aria-invalid={!!errors.city}
                      />

                      {errors.city && (
                        <p className="text-sm text-destructive">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* State */}
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="state"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                      >
                        State
                      </label>

                      <Input
                        id="state"
                        placeholder="State"
                        {...field}
                        aria-invalid={!!errors.state}
                      />

                      {errors.state && (
                        <p className="text-sm text-destructive">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* ====================================================
                  PINCODE + COUNTRY
              ==================================================== */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pincode */}
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="postalCode"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                      >
                        Pincode
                      </label>

                      <Input
                        id="postalCode"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="600001"
                        {...field}
                        aria-invalid={!!errors.postalCode}
                      />

                      {errors.postalCode && (
                        <p className="text-sm text-destructive">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Country */}
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="country"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                      >
                        Country
                      </label>

                      <Input
                        id="country"
                        placeholder="Country"
                        {...field}
                        aria-invalid={!!errors.country}
                      />

                      {errors.country && (
                        <p className="text-sm text-destructive">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* ====================================================
                  DEFAULT ADDRESS
              ==================================================== */}

              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 py-2">
                    <Checkbox
                      id="isDefault"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />

                    <label
                      htmlFor="isDefault"
                      className="text-xs font-medium cursor-pointer"
                    >
                      Set as default delivery address
                    </label>
                  </div>
                )}
              />

              {/* ====================================================
                  ACTIONS
              ==================================================== */}

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="flex-1 rounded-none py-6 border-foreground/20"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-none py-6 bg-primary hover:bg-primary/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingAddress ? (
                    "Update Address"
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}