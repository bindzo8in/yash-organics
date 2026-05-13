"use client";

import { useActionState, useEffect, startTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash, Package, Star, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "./image-upload";

import { cn } from "@/lib/utils";
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "@/lib/actions/products";
import { getImageUrl } from "@/lib/cloudinary-utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  mrp: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0, "Price is required"),
  stock: z.coerce.number().min(0, "Stock is required"),
  lowStockLevel: z.coerce.number().min(0),
  weight: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Category is required."),
  images: z.any().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: any;
  onSuccess: () => void;
  categories: any[];
}

export function ProductForm({
  initialData,
  onSuccess,
  categories,
}: ProductFormProps) {
  const actionWithId = initialData
    ? updateProduct.bind(null, initialData.id)
    : createProduct;

  const initialState: ProductActionState = {
    message: "",
    errors: {},
  };

  const [state, formAction, isPending] = useActionState(
    actionWithId,
    initialState
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          variants: initialData.variants || [],
        }
      : {
          name: "",
          slug: "",
          description: "",
          categoryId: "",
          images: [],
          variants: [{ name: "Standard", price: 0, stock: 0, lowStockLevel: 5, unit: "kg", weight: 0 }],
        },
  });

  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>(
    initialData?.productImages || []
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });


  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onSuccess();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const getErrors = (name: string) => {
    const serverErrors = (state.errors as any)?.[name];
    const clientError = (form.formState.errors as any)?.[name]?.message;

    const errors: { message?: string }[] = [];

    if (clientError) {
      errors.push({ message: clientError });
    }

    if (Array.isArray(serverErrors)) {
      serverErrors.forEach((message: string) => errors.push({ message }));
    } else if (serverErrors) {
      errors.push({ message: serverErrors as any });
    }

    return errors;
  };

  const handleAction = async (formData: FormData) => {
    const isValid = await form.trigger();

    if (!isValid) return;

    formData.set("images", JSON.stringify(images));
    formData.set("variants", JSON.stringify(form.getValues("variants") || []));

    // Handle primary image logic if not set
    const primaryExists = images.some(img => img.isPrimary);
    if (!primaryExists && images.length > 0) {
      images[0].isPrimary = true;
      formData.set("images", JSON.stringify(images));
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="w-full border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>
          {initialData ? "Update Product" : "Create Product"}
        </CardTitle>
        <CardDescription>
          Add product details, pricing, images, category, and optional variants.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="product-form" action={handleAction}>
          <input
            type="hidden"
            name="variants"
            value={JSON.stringify(form.watch("variants") || [])}
          />

          <input
            type="hidden"
            name="images"
            value={JSON.stringify(images)}
          />

          <FieldGroup>
            {/* Basic Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-name">
                      Product Name
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="product-name"
                        name="name"
                        placeholder="Herbal Hair Oil"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                      />
                    </FieldContent>
                    <FieldError errors={getErrors("name")} />
                  </Field>
                )}
              />

              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="product-slug"
                        name="slug"
                        placeholder="herbal-hair-oil"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                      />
                    </FieldContent>
                    <FieldError errors={getErrors("slug")} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-description">
                    Description
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="product-description"
                      name="description"
                      placeholder="Write a short product description..."
                      rows={5}
                      className="min-h-28 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length || 0} characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  <FieldDescription>
                    Add product benefits, ingredients, usage, or important notes.
                  </FieldDescription>

                  <FieldError errors={getErrors("description")} />
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-1">
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-category">
                      Category
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        name="categoryId"
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="product-category"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start" className="w-[--radix-select-trigger-width] bg-background">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContent>
                    <FieldError errors={getErrors("categoryId")} />
                  </Field>
                )}
              />
            </div>

            <Separator />

            {/* Product Images */}
            <Field>
              <FieldLabel>Product Images</FieldLabel>

              <FieldContent className="space-y-6">
                <ImageUpload
                  value={images.map(img => img.url)}
                  onChange={(url) => {
                    setImages(prev => [...prev, { url, isPrimary: prev.length === 0 }]);
                  }}
                  onRemove={(url) => {
                    setImages(prev => {
                      const newImages = prev.filter(i => i.url !== url);
                      const removedWasPrimary = prev.find(i => i.url === url)?.isPrimary;
                      if (removedWasPrimary && newImages.length > 0) {
                        newImages[0].isPrimary = true;
                      }
                      return newImages;
                    });
                  }}
                  primaryUrl={images.find(img => img.isPrimary)?.url}
                  onPrimaryChange={(url) => {
                    setImages(prev => prev.map(i => ({
                      ...i,
                      isPrimary: i.url === url
                    })));
                  }}
                  folder="products"
                  disabled={isPending}
                />

                {images.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-10 text-muted-foreground">
                    <ImageIcon className="mb-2 h-8 w-8 opacity-25" />
                    <p className="text-xs font-medium uppercase tracking-widest">
                      No images selected
                    </p>
                  </div>
                )}
              </FieldContent>

              <FieldError errors={getErrors("images")} />
            </Field>

            <Separator />

            {/* Variants */}
            <Field>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <FieldLabel className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5" />
                    Product Variants
                  </FieldLabel>
                  <FieldDescription>
                    Add size, weight, or pack based pricing and stock.
                  </FieldDescription>
                </div>

                 <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ 
                    name: "", 
                    price: 0, 
                    stock: 0, 
                    weight: 0, 
                    unit: "kg",
                    lowStockLevel: 5 
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              <FieldContent className="space-y-4">
                {fields.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                    No variants added. Base price and stock will be used.
                  </div>
                )}

                {fields.map((variantField, index) => (
                   <div
                    key={variantField.id}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 relative group transition-all hover:border-emerald-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-emerald-100/50 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">{index + 1}</div>
                        Variant Configuration
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2 -mr-1"
                        >
                          <Trash className="h-3.5 w-3.5 mr-1" />
                          <span className="text-[10px] font-bold uppercase">Remove</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                      <Controller
                        name={`variants.${index}.name`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`variant-name-${index}`}>
                              Name
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                {...field}
                                id={`variant-name-${index}`}
                                placeholder="100ml"
                                aria-invalid={fieldState.invalid}
                                className="bg-white/50"
                              />
                            </FieldContent>
                            <FieldError
                              errors={getErrors(`variants.${index}.name`)}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`variants.${index}.price`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`variant-price-${index}`}>
                              Price ₹
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                {...field}
                                id={`variant-price-${index}`}
                                type="number"
                                min={0}
                                placeholder="399"
                                aria-invalid={fieldState.invalid}
                                className="bg-white/50"
                              />
                            </FieldContent>
                            <FieldError
                              errors={getErrors(`variants.${index}.price`)}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`variants.${index}.stock`}
                        control={form.control}
                        render={({ field, fieldState }) => {
                          const isExisting = !!initialData && !!form.getValues(`variants.${index}.id`);
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`variant-stock-${index}`}>
                                Stock
                              </FieldLabel>
                              <FieldContent>
                                <Input
                                  {...field}
                                  id={`variant-stock-${index}`}
                                  type="number"
                                  min={0}
                                  placeholder="10"
                                  aria-invalid={fieldState.invalid}
                                  className={cn(
                                    "bg-white/50",
                                    isExisting && "bg-secondary/20 cursor-not-allowed"
                                  )}
                                  disabled={isExisting || isPending}
                                />
                              </FieldContent>
                              <FieldError
                                errors={getErrors(`variants.${index}.stock`)}
                              />
                              {isExisting && (
                                <p className="mt-1 text-[9px] text-muted-foreground leading-tight">
                                  Use the{" "}
                                  <span className="font-bold text-emerald-600">
                                    Quick Stock Update
                                  </span>{" "}
                                  tool on the products page to manage inventory.
                                </p>
                              )}
                            </Field>
                          );
                        }}
                      />

                      <Controller
                        name={`variants.${index}.lowStockLevel`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`variant-lowStockLevel-${index}`}>
                              Low Stock Level
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                {...field}
                                id={`variant-lowStockLevel-${index}`}
                                type="number"
                                min={0}
                                placeholder="5"
                                aria-invalid={fieldState.invalid}
                                className="bg-white/50"
                              />
                            </FieldContent>
                            <FieldError
                              errors={getErrors(`variants.${index}.lowStockLevel`)}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`variants.${index}.weight`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`variant-weight-${index}`}>
                              Weight
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                {...field}
                                id={`variant-weight-${index}`}
                                type="number"
                                min={0}
                                placeholder="100"
                                aria-invalid={fieldState.invalid}
                                className="bg-white/50"
                              />
                            </FieldContent>
                            <FieldError
                              errors={getErrors(`variants.${index}.weight`)}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`variants.${index}.unit`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`variant-unit-${index}`}>
                              Unit
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                {...field}
                                id={`variant-unit-${index}`}
                                placeholder="g"
                                aria-invalid={fieldState.invalid}
                                className="bg-white/50"
                              />
                            </FieldContent>
                            <FieldError
                              errors={getErrors(`variants.${index}.unit`)}
                            />
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </FieldContent>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => form.reset()}
        >
          Reset
        </Button>

        <Button
          type="submit"
          form="product-form"
          className="h-11 w-full bg-emerald-600 text-base hover:bg-emerald-700 sm:w-auto"
          disabled={isPending}
        >
          {isPending
            ? "Saving..."
            : initialData
              ? "Update Product"
              : "Create Product"}
        </Button>
      </CardFooter>
    </Card>
  );
}