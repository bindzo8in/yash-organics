import z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  image: z.any().optional(),
  parentId: z.string().min(1).optional().nullable(),
  order: z.coerce.number().int().min(0, "Order must be a positive number"),
});

export type CategorySchema = z.infer<typeof categorySchema>;
