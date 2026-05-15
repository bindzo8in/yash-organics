"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { canCancelOrder, canReturnOrder } from "@/lib/utils/order-logic";

export type OrderActionResponse = {
  success: boolean;
  message: string;
};

export async function cancelOrder(orderId: string, reason: string): Promise<OrderActionResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { orderItems: true }
    });

    if (!order) throw new Error("Order not found");

    if (!canCancelOrder(order)) {
      throw new Error("This order cannot be cancelled at this stage.");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: reason,
        }
      });

      // 2. Restore Stock (RESTOCK)
      // Since it's cancelled before shipping, we use RESTOCK type
      for (const item of order.orderItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity }
          }
        });

        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            type: "RESTOCK",
            reason: `Order #${orderId.slice(-6)} cancelled by customer. Reason: ${reason}`
          }
        });
      }
    });

    revalidatePath("/profile/orders");
    revalidatePath(`/order-status/${orderId}`);
    return { success: true, message: "Order cancelled successfully." };
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to cancel order." 
    };
  }
}

export async function requestReturn(orderId: string, reason: string): Promise<OrderActionResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId }
    });

    if (!order) throw new Error("Order not found");

    if (!canReturnOrder(order)) {
      throw new Error("This order is not eligible for return.");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "RETURN_REQUESTED",
        returnRequestedAt: new Date(),
        returnReason: reason,
      }
    });

    revalidatePath("/profile/orders");
    revalidatePath(`/order-status/${orderId}`);
    return { success: true, message: "Return requested successfully." };
  } catch (error) {
    console.error("Return Request Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to request return." 
    };
  }
}
