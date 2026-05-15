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
  const paymentStatus = formData.get("paymentStatus") as string;
  const courierPartner = formData.get("courierPartner") as string;
  const trackingId = formData.get("trackingId") as string;
  const trackingUrl = formData.get("trackingUrl") as string;
  const adminNote = formData.get("adminNote") as string;

  try {
    const oldOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (!oldOrder) return { success: false, message: "Order not found" };

    await prisma.$transaction(async (tx) => {
      // 1. Prepare Update Data
      const updateData: any = {
        orderStatus: newStatus as any,
        paymentStatus: paymentStatus as any,
        courierPartner,
        trackingId,
        trackingUrl,
        adminNote,
      };

      // Set timestamps if they don't exist yet
      if (newStatus === "CONFIRMED" && !oldOrder.confirmedAt) updateData.confirmedAt = new Date();
      if (newStatus === "PROCESSING" && !oldOrder.processingAt) updateData.processingAt = new Date();
      if (newStatus === "SHIPPED" && !oldOrder.shippedAt) updateData.shippedAt = new Date();
      if (newStatus === "DELIVERED" && !oldOrder.deliveredAt) updateData.deliveredAt = new Date();
      if (newStatus === "CANCELLED" && !oldOrder.cancelledAt) updateData.cancelledAt = new Date();

      // Return-specific timestamps
      if (newStatus === "RETURN_APPROVED" && !oldOrder.returnApprovedAt) updateData.returnApprovedAt = new Date();
      if (newStatus === "RETURN_REJECTED" && !oldOrder.returnRejectedAt) updateData.returnRejectedAt = new Date();
      if (newStatus === "RETURNED" && !oldOrder.returnedAt) updateData.returnedAt = new Date();
      if (newStatus === "REFUNDED" && !oldOrder.refundedAt) updateData.refundedAt = new Date();

      // 2. Update the order
      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // 3. Handle Stock Restoration
      // We restore stock ONLY if moving TO Cancelled OR Returned FROM a status that already deducted stock.
      // Deduction happens at CONFIRMED (in verifyPayment).
      const alreadyDeducted = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED"].includes(oldOrder.orderStatus);
      
      const isRestoringNow = ["CANCELLED", "RETURNED"].includes(newStatus) && 
                             !["CANCELLED", "RETURNED", "REFUNDED"].includes(oldOrder.orderStatus);

      if (isRestoringNow && alreadyDeducted) {
        for (const item of oldOrder.orderItems) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });

          // Distinguish between RESTOCK (cancel) and RETURN (actual return)
          const transactionType = newStatus === "CANCELLED" ? "RESTOCK" : "RETURN";

          await tx.stockTransaction.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              type: transactionType as any,
              reason: `Order #${orderId.slice(-6)} updated to ${newStatus} by admin. Note: ${adminNote || 'No note'}`
            }
          });
        }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/order-status/${orderId}`);
    return { success: true, message: `Order updated to ${newStatus}` };
  } catch (error) {
    console.error("Order update error:", error);
    return { success: false, message: "Failed to update order" };
  }
}
