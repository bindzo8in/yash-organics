"use client";

import { useActionState, useEffect, startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { createHeroSlide, updateHeroSlide, type HeroSlideState } from "@/lib/actions/hero-slides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().min(1, "Image is required."),
  link: z.string().optional(),
  ctaText: z.string().min(1, "CTA Text is required"),
  order: z.coerce.number(),
  isActive: z.string(),
});

type HeroSlideFormValues = z.infer<typeof formSchema>;

interface HeroSlideFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function HeroSlideForm({ initialData, onSuccess }: HeroSlideFormProps) {
  const actionWithId = initialData
    ? updateHeroSlide.bind(null, initialData.id)
    : createHeroSlide;

  const [state, formAction, isPending] = useActionState(
    actionWithId,
    { success: false, message: "" } as HeroSlideState
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      isActive: initialData.isActive ? "true" : "false",
    } : {
      title: "",
      subtitle: "",
      description: "",
      image: "",
      link: "",
      ctaText: "Shop Now",
      order: 0,
      isActive: "true",
    },
  });

  const watchImage = watch("image");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onSuccess();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const onSubmit = (data: HeroSlideFormValues) => {
    if (isUploading) {
      toast.error("Please wait for image to finish uploading");
      return;
    }
    console.log(data)
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Slide Information</CardTitle>
              <CardDescription>
                Define the content that will appear on the hero slide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input {...register("title")} placeholder="Main heading" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle</label>
                  <Input {...register("subtitle")} placeholder="Little text above title" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...register("description")} placeholder="Short description" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text (CTA)</label>
                  <Input {...register("ctaText")} placeholder="e.g. Shop Now" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link URL</label>
                  <Input {...register("link")} placeholder="/products?category=..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Background Image</CardTitle>
              <CardDescription>
                Upload a high-quality background image for the slide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                <div className="font-bold uppercase text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5">Recommended</div>
                <p>
                  Size: <b>1920 x 800px</b> or <b>1920 x 1080px</b>. Keep the subject centered or to the right for better text visibility. Max 1MB.
                </p>
              </div>
              <ImageUpload
                value={watchImage ? [watchImage] : []}
                onChange={(url) => setValue("image", url)}
                onRemove={() => setValue("image", "")}
                folder="hero-slides"
                disabled={isPending}
                multiple={false}
                onUploading={setIsUploading}
              />
              {errors.image && <p className="text-xs text-destructive mt-2">{errors.image.message}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Status & Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input type="number" {...register("order")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  onValueChange={(val) => setValue("isActive", val)}
                  defaultValue={initialData?.isActive ? "true" : "true"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending || isUploading} className="w-full h-12"
          >
            {isPending ? "Saving..." : isUploading ? "Uploading..." : initialData ? "Update Slide" : "Create Slide"}
          </Button>
        </div>
      </div>
    </form>
  );
}
