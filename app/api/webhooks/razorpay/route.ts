import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/mail";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`Received Razorpay webhook event: ${event.event}`);

    // Handle different events
    switch (event.event) {
      case "order.paid":
      case "payment.captured": {
        const orderId = event.payload?.payment?.entity?.order_id;
        const paymentId = event.payload?.payment?.entity?.id;
        
        if (!orderId) {
          console.error("No order_id in payment.captured payload");
          return NextResponse.json({ error: "No order ID in payload" }, { status: 400 });
        }

        const existingOrder = await prisma.order.findUnique({
          where: { razorpayOrderId: orderId },
          include: { orderItems: true, user: true }
        });

        if (!existingOrder) {
          console.error(`Order not found for razorpayOrderId: ${orderId}`);
          return NextResponse.json({ success: true, message: "Order not found, skipping" });
        }

        // Idempotency check: if already paid, do nothing
        if (existingOrder.paymentStatus === "PAID") {
          return NextResponse.json({ success: true, message: "Order already marked as PAID" });
        }

        // Update Order Status in Transaction
        await prisma.$transaction(async (tx) => {
          // Check again inside transaction to prevent race conditions
          const checkOrder = await tx.order.findUnique({ where: { id: existingOrder.id }});
          if (checkOrder?.paymentStatus === "PAID") return;

          await tx.order.update({
            where: { id: existingOrder.id },
            data: {
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED",
              confirmedAt: new Date(),
              razorpayPaymentId: paymentId,
            },
          });

          // 1. Update Inventory
          for (const item of existingOrder.orderItems) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: { decrement: item.quantity },
              },
            });

            await tx.stockTransaction.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                quantity: -item.quantity,
                type: "SALE",
                reason: `Order #${existingOrder.id} (Webhook)`,
              },
            });
          }
          
          // 2. Clear user's database cart after successful payment
          const cart = await tx.cart.findFirst({
            where: { userId: existingOrder.userId }
          });
          
          if (cart) {
            await tx.cartItem.deleteMany({
              where: { cartId: cart.id }
            });
          }
        }, {
          maxWait: 5000,
          timeout: 10000,
        });

        // Send confirmation email if it hasn't been sent yet
        // Since we checked idempotency, we know this is the first time we process the payment
        if (existingOrder.user?.email) {
          await sendOrderConfirmationEmail(
            existingOrder.user.email,
            existingOrder.user.name,
            existingOrder.id,
            existingOrder.totalAmount
          );

          // Send admin notification email
          await sendAdminOrderNotificationEmail(
            existingOrder.id,
            "NEW_ORDER",
            existingOrder.totalAmount,
            existingOrder.user.name
          );

          // Create admin notification in database
          await prisma.notification.create({
            data: {
              type: "NEW_ORDER",
              message: `New order #${existingOrder.id.slice(-6).toUpperCase()} placed by ${existingOrder.user.name}`,
              orderId: existingOrder.id,
            }
          });
        }

        break;
      }
      
      case "payment.failed": {
         const orderId = event.payload?.payment?.entity?.order_id;
         if (!orderId) break;

         const existingOrder = await prisma.order.findUnique({
          where: { razorpayOrderId: orderId }
         });

         if (existingOrder && existingOrder.paymentStatus === "PENDING") {
           await prisma.order.update({
             where: { id: existingOrder.id },
             data: { paymentStatus: "FAILED" }
           });
           console.log(`Order ${existingOrder.id} marked as FAILED due to webhook`);
         }
         break;
      }
      
      case "refund.processed": {
         // This handles refunds made from the Razorpay dashboard or async refund completion
         const paymentId = event.payload?.refund?.entity?.payment_id;
         const refundId = event.payload?.refund?.entity?.id;
         
         if (!paymentId) break;

         const existingOrder = await prisma.order.findFirst({
           where: { razorpayPaymentId: paymentId }
         });

         if (existingOrder && existingOrder.orderStatus !== "REFUNDED") {
            await prisma.order.update({
              where: { id: existingOrder.id },
              data: {
                orderStatus: "REFUNDED",
                refundedAt: new Date(),
                refundTransactionId: refundId,
                adminNote: existingOrder.adminNote 
                    ? `${existingOrder.adminNote}\n[Webhook] Refund processed asynchronously or externally (ID: ${refundId})` 
                    : `[Webhook] Refund processed asynchronously or externally (ID: ${refundId})`
              }
            });
            console.log(`Order ${existingOrder.id} marked as REFUNDED via webhook`);
         }
         break;
      }

      case "refund.failed": {
         const paymentId = event.payload?.refund?.entity?.payment_id;
         console.error(`Refund failed for payment ID: ${paymentId}`);
         // Here we could notify admin or log it to a monitoring service
         break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
