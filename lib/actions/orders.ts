"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";


export type OrderActionState = {
  success?: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateOrderStatus(
  orderId: string, 
  prevState: OrderActionState, 
  formData: FormData,
): Promise<OrderActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const newStatus = formData.get("orderStatus") as string;
  const courierPartner = formData.get("courierPartner") as string;
  const trackingId = formData.get("trackingId") as string;

  try {
    const oldOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (!oldOrder) return { success: false, message: "Order not found" };

    await prisma.$transaction(async (tx) => {
      // 1. Update the order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newStatus as any,
          courierPartner,
          trackingId,
        },
      });

      // 2. Handle Stock Restoration for Returns/Cancellations
      // If we are moving TO Returned/Cancelled FROM a status that already deducted stock (Confirmed/Shipped/Delivered)
      const needsRestoration = ["RETURNED", "CANCELLED"].includes(newStatus) && 
                               ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(oldOrder.orderStatus);

      if (needsRestoration) {
        for (const item of oldOrder.orderItems) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant) throw new Error(`Variant ${item.variantId} not found`);

          const itemPrice = variant.price;
          const itemWeight = variant.weight || 0;

          // Every OrderItem in this schema has a variantId
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });

          await tx.stockTransaction.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              type: "RETURN",
              reason: `Order #${orderId.slice(-6)} marked as ${newStatus}`
            }
          });
        }
      }
    });

    revalidatePath("/admin/orders");
    return { success: true, message: `Order updated to ${newStatus}` };
  } catch (error) {
    console.error("Order update error:", error);
    return { success: false, message: "Failed to update order" };
  }
}
