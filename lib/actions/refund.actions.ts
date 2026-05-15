"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { razorpay } from "@/lib/razorpay";
import { revalidatePath } from "next/cache";
import { canRefundOrder } from "@/lib/utils/order-logic";

export type RefundActionResponse = {
  success: boolean;
  message: string;
};

export async function initiateRefund(
  orderId: string, 
  reason: string
): Promise<RefundActionResponse> {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Only admins can initiate refunds.");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found.");
    if (!order.razorpayPaymentId) throw new Error("No payment record found for this order.");

    if (!canRefundOrder(order)) {
      throw new Error("This order is not eligible for a refund.");
    }

    // 1. Initiate Razorpay Refund
    // Amount is passed in paise. We'll do a full refund by default.
    const refundAmount = Math.round(order.totalAmount * 100);
    
    let refundId = "manual_refund_" + Date.now();
    
    // In production/testing with live keys, this would work.
    // If keys are not valid or it's a test environment without webhook support,
    // we should handle potential errors but still allow manual override if needed?
    // User said "webhook is not implemented yet due to the webhook is not available in testing environment"
    // So we'll try the API, and if it fails due to environment, we might need a fallback or just log it.
    
    try {
      const rzpRefund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: refundAmount,
        notes: {
          reason,
          orderId,
          initiatedBy: session?.user?.email || "Admin",
        },
      });
      refundId = rzpRefund.id;
    } catch (rzpError: any) {
      console.error("Razorpay Refund API Error:", rzpError);
      // If it's a known error like "Payment already refunded" or "Invalid ID", we should stop.
      // If it's a network error or key error, we might want to inform the admin.
      throw new Error(`Razorpay Refund failed: ${rzpError.description || rzpError.message || "Unknown error"}`);
    }

    // 2. Update Order in DB
    await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "REFUNDED",
        refundedAt: new Date(),
        refundTransactionId: refundId,
        adminNote: order.adminNote 
          ? `${order.adminNote}\n[Refund] ${reason}` 
          : `[Refund] ${reason}`,
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/order-status/${orderId}`);
    
    return { 
      success: true, 
      message: `Refund of ₹${order.totalAmount} initiated successfully (ID: ${refundId}).` 
    };
  } catch (error) {
    console.error("Initiate Refund Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to initiate refund." 
    };
  }
}
