import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: productId } = await params;
    const body = await req.json();
    const { variantUpdates } = body; // Array of { variantId: string, quantity: number, type: string, reason: string }

    if (!variantUpdates || !Array.isArray(variantUpdates)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const results = await prisma.$transaction(async (tx) => {
      const updatedVariants = [];

      for (const update of variantUpdates) {
        const { variantId, quantity, type, reason } = update;

        if (quantity === 0) continue;

        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
        });

        if (!variant) {
          throw new Error(`Variant ${variantId} not found`);
        }

        if (variant.productId !== productId) {
          throw new Error(`Variant ${variantId} does not belong to product ${productId}`);
        }

        const newStock = variant.stock + quantity;

        if (newStock < 0) {
          throw new Error(`Insufficient stock for variant ${variant.name}. Current: ${variant.stock}, Requested: ${quantity}`);
        }

        // Update variant stock
        const updatedVariant = await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: newStock },
        });

        // Record transaction
        await tx.stockTransaction.create({
          data: {
            productId,
            variantId,
            quantity,
            type: (type || "ADJUSTMENT") as any,
            reason: reason || "Manual adjustment",
          },
        });

        updatedVariants.push(updatedVariant);
      }

      return updatedVariants;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    revalidatePath("/admin/products");
    return NextResponse.json({ success: true, updatedVariants: results });
  } catch (error: any) {
    console.error("Stock update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update stock" }, { status: 500 });
  }
}
