import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the order with its items and user details to process stock and email
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
        include: { orderItems: true, user: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Already paid check to avoid double decrement
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ message: "Payment already processed" }, { status: 200 });
      }

      // Use a transaction for atomic order update + stock decrement
      await prisma.$transaction(async (tx) => {
        // 1. Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED",
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
        });

        // 2. Decrement stock for each item
        for (const item of order.orderItems) {
          // Update Variant Stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
          
          // Log Variant Transaction
          await tx.stockTransaction.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              quantity: -item.quantity,
              type: "SALE",
              reason: `Order #${order.id.slice(-6)} payment success`
            }
          });
        }
      });

      // Send Order Confirmation Email
      if (order.user && order.user.email) {
        await sendOrderConfirmationEmail(
          order.user.email,
          order.user.name,
          order.id,
          order.totalAmount
        );
      }

      return NextResponse.json({ message: "Payment verified and stock updated" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
