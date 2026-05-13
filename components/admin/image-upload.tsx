"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Star, Trash } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/cloudinary-utils";

interface ImageUploadProps {
  value: string[]; // Array of secure_urls
  onChange: (url: string, result: any) => void;
  onRemove: (url: string) => void;
  primaryUrl?: string | null;
  onPrimaryChange?: (url: string) => void;
  folder?: string;
  disabled?: boolean;
  multiple?: boolean;
  onUploading?: (uploading: boolean) => void;
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  primaryUrl,
  onPrimaryChange,
  folder = "general",
  disabled,
  multiple = true,
  onUploading,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<{ id: string; url: string; uploading: boolean }[]>([]);

  const onUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // If multiple is false, only take the first file
    const filesToUpload = multiple ? Array.from(files) : [files[0]];

    setIsUploading(true);
    onUploading?.(true);

    const uploadPromises = filesToUpload.map(async (file) => {
      // Create local preview
      const localUrl = URL.createObjectURL(file);
      const tempId = Math.random().toString(36).substring(7);
      
      setPreviews((prev) => [...prev, { id: tempId, url: localUrl, uploading: true }]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const result = await response.json();
        
        // Remove temp preview and call onChange
        setPreviews((prev) => prev.filter((p) => p.id !== tempId));
        onChange(result.secure_url, result);
        
        // Cleanup local URL
        URL.revokeObjectURL(localUrl);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image");
        setPreviews((prev) => prev.filter((p) => p.id !== tempId));
        URL.revokeObjectURL(localUrl);
      }
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
    onUploading?.(false);
  }, [folder, onChange, multiple, onUploading]);

  // Determine if we can show the upload button
  const canUpload = !disabled && (multiple || (value.length === 0 && previews.length === 0));

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap gap-4">
        {/* Existing Images */}
        {value.map((url) => (
          <div 
            key={url} 
            className={cn(
              "relative w-40 h-40 rounded-lg overflow-hidden border bg-secondary/20 group transition-all",
              primaryUrl === url && "ring-2 ring-emerald-500 border-emerald-500"
            )}
          >
            <img
              src={getImageUrl(url)}
              alt="Upload"
              className="object-cover w-full h-full"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {multiple && onPrimaryChange && (
                  <Button
                    type="button"
                    variant={primaryUrl === url ? "default" : "secondary"}
                    size="icon"
                    className={cn("rounded-full", primaryUrl === url && "bg-emerald-500 hover:bg-emerald-600")}
                    onClick={() => onPrimaryChange(url)}
                  >
                    <Star className={cn("h-4 w-4", primaryUrl === url && "fill-current")} />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="rounded-full shadow-lg"
                  onClick={() => onRemove(url)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
            {multiple && primaryUrl === url && (
              <div className="absolute left-2 top-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white shadow-sm">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Uploading Previews */}
        {previews.map((preview) => (
          <div key={preview.id} className="relative w-40 h-40 rounded-lg overflow-hidden border bg-secondary/10 flex items-center justify-center">
            <img
              src={preview.url}
              alt="Preview"
              className="object-cover w-full h-full opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {canUpload && (
          <label className={cn(
            "w-40 h-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors",
            isUploading && "pointer-events-none opacity-50"
          )}>
            <input
              type="file"
              className="hidden"
              multiple={multiple}
              accept="image/*"
              onChange={onUpload}
              disabled={isUploading}
            />
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center px-2">
              {isUploading ? "Uploading..." : multiple ? "Upload Images" : "Upload Image"}
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
