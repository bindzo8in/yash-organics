import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/cart
 * Fetch the current user's cart and its items.
 * Restricted to CUSTOMER/ADMIN.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        cartItems: { 
          include: { 
            product: true,
            variant: true
          } 
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: { 
          cartItems: { 
            include: { 
              product: true,
              variant: true
            } 
          } 
        },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Add or update item in cart.
 * Uses upsert with unique constraint on [cartId, productId, variantId].
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, variantId, quantity, price } = await req.json();

    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // 1. Find if the item already exists in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      }
    });

    let cartItem;
    if (existingItem) {
      // 2. Update existing item
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: { increment: quantity },
          price: price // Update to latest price
        },
      });
    } else {
      // 3. Create new item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
          price,
        },
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart
 * Remove a specific item or clear the cart.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("cartItemId");
    const clearAll = searchParams.get("clearAll") === "true";

    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (clearAll) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      return NextResponse.json({ message: "Cart cleared" });
    }

    if (cartItemId) {
      // Verify ownership before deleting
      await prisma.cartItem.delete({
        where: { id: cartItemId, cartId: cart.id },
      });
      return NextResponse.json({ message: "Item removed" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
  }
}
