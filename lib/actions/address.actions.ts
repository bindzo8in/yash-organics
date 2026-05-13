"use server"; // Note: This will be a mix of server actions and client logic in practice, but I'll define actions here.

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Valid pincode is required"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export async function getAddresses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });
}

export async function createAddress(data: AddressInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    console.log("DEBUG: Creating address for userId:", session.user.id);
    console.log("DEBUG: Session user:", session.user);
  
    const validated = addressSchema.parse(data);
    
    // Verify user exists in DB to prevent foreign key violations from stale sessions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      throw new Error("Your session is invalid or the user has been deleted. Please log out and log in again.");
    }
  
    // If this is the first address, or isDefault is true, unset other defaults
    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }
  
    const address = await prisma.address.create({
      data: {
        ...validated,
        userId: session.user.id,
        addressLine2: validated.addressLine2 || "",
      },
    });
  
    revalidatePath("/profile/addresses");
    return { success: true, address };
  } catch (error: any) {
    console.error("Address creation error:", error);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error(error.message || "Failed to create address");
  }
}

export async function updateAddress(id: string, data: Partial<AddressInput>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.update({
    where: { id, userId: session.user.id },
    data: {
        ...data,
        addressLine2: data.addressLine2 ?? ""
    },
  });

  revalidatePath("/profile/addresses");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.address.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/profile/addresses");
  return { success: true };
}
