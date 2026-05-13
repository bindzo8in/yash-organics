"use client";

import { useActionState, useEffect, startTransition, useState } from "react";
import { Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { createCategory, updateCategory, type CategoryActionState } from "@/lib/actions/categories";
import { toast } from "sonner";
import { categorySchema, CategorySchema } from "@/lib/validators/category";
import { ImageUpload } from "./image-upload";



interface CategoryFormProps {
  initialData?: any;
  onSuccess: () => void;
  categories: any[];
}

export function CategoryForm({ initialData, onSuccess, categories }: CategoryFormProps) {
  const actionWithId = initialData
    ? updateCategory.bind(null, initialData.id)
    : createCategory;

  const initialState: CategoryActionState = {
    message: "",
    errors: {},
  };

  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      image: undefined,
      parentId: null,
    },
  });



  const handleAction = async (formData: FormData) => {
    const isValid = await form.trigger();
    if (isValid) {
      const image = form.getValues("image");
      if (image instanceof File) {
        formData.set("image", image);
      } else if (typeof image === "string") {
        formData.set("image", image);
      }

      startTransition(() => {
        formAction(formData);
      });
    }
  };

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
    const clientError = form.formState.errors[name as keyof CategorySchema]?.message;

    const errors: { message?: string }[] = [];
    if (clientError) errors.push({ message: clientError as string });
    if (Array.isArray(serverErrors)) {
      serverErrors.forEach((msg: string) => errors.push({ message: msg }));
    } else if (serverErrors) {
      errors.push({ message: serverErrors as any });
    }
    return errors;
  };

  return (
    <form action={handleAction} className="space-y-4 pt-4">
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <Input id="name" {...form.register("name")} placeholder="e.g. Organic Fruits" />
        </FieldContent>
        <FieldError errors={getErrors("name")} />
      </Field>

      <Field>
        <FieldLabel htmlFor="slug">Slug</FieldLabel>
        <FieldContent>
          <Input id="slug" {...form.register("slug")} placeholder="organic-fruits" />
        </FieldContent>
        <FieldError errors={getErrors("slug")} />
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <FieldContent>
          <Input id="description" {...form.register("description")} placeholder="Short description..." />
        </FieldContent>
        <FieldError errors={getErrors("description")} />
      </Field>

      <Field>
        <FieldLabel htmlFor="image">Category Image</FieldLabel>
        <FieldContent>
          <ImageUpload
            value={form.watch("image") ? [form.watch("image")] : []}
            onChange={(url) => form.setValue("image", url)}
            onRemove={() => form.setValue("image", "")}
            folder="categories"
            disabled={isPending}
            multiple={false}
          />
        </FieldContent>
        <FieldError errors={getErrors("image")} />
      </Field>

      {!initialData?.parentId && (
        <Field>
          <FieldLabel htmlFor="parentId">Parent Category (Optional)</FieldLabel>
          <FieldContent>
            <Select
              onValueChange={(val) => {
                form.setValue("parentId", val === "none" ? null : val);
              }}
              defaultValue={form.getValues("parentId") || "none"}
              name="parentId"
            >
              <SelectTrigger id="parentId">
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[--radix-select-trigger-width] bg-background">
                <SelectItem value="none">None (Top Level)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          <FieldError errors={getErrors("parentId")} />
        </Field>
      )}

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isPending}
      >
        {isPending ? "Saving..." : initialData ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}
