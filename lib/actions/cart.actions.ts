"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type CartItemInput = {
  id: string; // This is productId
  variantId: string;
  quantity: number;
  sellingPrice: number;
};

export async function getDbCart() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cart = await prisma.cart.findFirst({
    where: { userId: session.user.id },
    include: {
      cartItems: {
        include: {
          product: {
            include: {
              productImages: {
                where: { isPrimary: true }
              },
              category: true
            }
          },
          variant: true
        }
      }
    }
  });

  if (!cart) return null;

  // Map to the format expected by useCart hook
  return cart.cartItems.map(item => ({
    id: item.productId,
    name: item.product.name,
    slug: item.product.slug,
    image: item.product.productImages[0]?.url || "",
    category: item.product.category,
    sellingPrice: item.sellingPrice,
    quantity: item.quantity,
    variantId: item.variantId,
    variantName: item.variant.name
  }));
}

export async function syncCartWithDb(items: CartItemInput[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = session.user.id;



    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 0. Get the user from db
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true }
      })
      if(!user) return { success: false, error: "User not found" };
      // 1. Get or create cart
      let cart = await tx.cart.findFirst({
        where: { userId: user.id }
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: user.id }
        });
      }

      // 2. Fetch existing items in DB cart
      const existingItems = await tx.cartItem.findMany({
        where: { cartId: cart.id }
      });

      // 3. Merge Logic:
      // For each item from client, upsert it into DB.
      // If client items are provided, they take precedence or merge quantities?
      // Usually, for "sync", we want the DB to match the client's current state during the session.
      
      // Delete items in DB that are not in the client list (if we want exact sync)
      // Or just upsert everything.
      
      for (const item of items) {
        await tx.cartItem.upsert({
          where: {
            cartId_productId_variantId: {
              cartId: cart.id,
              productId: item.id,
              variantId: item.variantId
            }
          },
          update: {
            quantity: item.quantity,
            sellingPrice: item.sellingPrice
          },
          create: {
            cartId: cart.id,
            productId: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice
          }
        });
      }

      // Optional: Remove items from DB that are not in the current client items list
      const clientItemKeys = items.map(i => `${i.id}-${i.variantId}`);
      for (const existing of existingItems) {
        const key = `${existing.productId}-${existing.variantId}`;
        if (!clientItemKeys.includes(key)) {
          await tx.cartItem.delete({
            where: { id: existing.id }
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Sync Cart Error:", error);
    return { success: false, error: "Failed to sync cart" };
  }
}

export async function clearDbCart() {
  const session = await auth();
  if (!session?.user?.id) return;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true }
  });
  if(!user) return;

  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    select: { id: true }
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }
}
