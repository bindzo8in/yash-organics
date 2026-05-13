"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { razorpay } from "@/lib/razorpay";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { checkDeliveryAvailability } from "@/lib/services/delivery.service";
import { sendOrderConfirmationEmail } from "@/lib/mail";

export async function createOrder(data: {
  addressId: string;
  cartItems: any[];
  totalAmount: number;
}) {
 try {
   const session = await auth();
   if (!session?.user?.id) throw new Error("Unauthorized");
 
   const { addressId, cartItems, totalAmount } = data;
 
   // 1. Validate Address
   const address = await prisma.address.findUnique({
     where: { id: addressId, userId: session.user.id },
   });
   if (!address) throw new Error("Invalid address");
 
   // 2. Validate Inventory & Price (Edge Case: Price changed or out of stock)
   let serverTotalAmount = 0;
   const validatedItems = [];
 
   for (const item of cartItems) {
     const variantId = item.variantId || item.id;
     const variant = await prisma.productVariant.findUnique({
       where: { id: variantId },
       include: { 
         product: { 
           include: { 
             productImages: {
               where: { isPrimary: true }
             } 
           } 
         } 
       }
     });
     
     if (!variant || !variant.isActive || variant.stock < item.quantity) {
       throw new Error(`Item ${item.name || variant?.product.name} is unavailable or out of stock.`);
     }
 
     serverTotalAmount += variant.price * item.quantity;
 
     validatedItems.push({
       productId: variant.productId,
       variantId: variantId,
       quantity: item.quantity,
       price: variant.price,
       productName: variant.product.name,
       variantName: variant.name,
       productImage: variant.product.productImages[0]?.url || null,
     });
   }
 
   // 3. Calculate Delivery Charge
   const deliveryInfo = await checkDeliveryAvailability(address.postalCode, serverTotalAmount);
   if (!deliveryInfo.isAvailable) throw new Error("Delivery not available for this pincode.");
 
   const finalAmount = serverTotalAmount + deliveryInfo.deliveryCharge;
 
   // 4. Create Razorpay Order
   const razorpayOrder = await razorpay.orders.create({
     amount: Math.round(finalAmount * 100), // In paise
     currency: "INR",
     receipt: `receipt_${Date.now()}`,
   });
 
   // 5. Save Order in DB with PENDING status
   const order = await prisma.order.create({
     data: {
       userId: session.user.id,
       addressId: addressId,
       // Snapshot address details
       shippingName: address.fullName,
       shippingPhone: address.phone,
       shippingEmail: address.email,
       shippingAddress: `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.postalCode}, ${address.country}`,
       
       totalAmount: finalAmount,
       deliveryCharge: deliveryInfo.deliveryCharge,
       razorpayOrderId: razorpayOrder.id,
       paymentStatus: "PENDING",
       orderStatus: "PENDING",
       orderItems: {
         create: validatedItems,
       },
     },
   });
 
   return {
     success: true,
     orderId: order.id,
     razorpayOrderId: razorpayOrder.id,
     amount: razorpayOrder.amount,
     currency: razorpayOrder.currency,
   };
 } catch (error) {
    console.error(error)
    return {
      success:false,
      error: error instanceof Error ? error.message : "Failed to create order",
    }
 }
}

export async function verifyPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = data;

  // 1. Verify Signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  const isSignatureValid = expectedSignature === razorpaySignature;

  if (!isSignatureValid) {
    throw new Error("Invalid payment signature");
  }

  // 2. Update Order Status
  await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) throw new Error("Order not found");
    if (existingOrder.paymentStatus === "PAID") return; // Already processed by webhook

    // Update order
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        razorpayPaymentId,
        razorpaySignature,
      },
      include: { orderItems: true },
    });

    // 3. Update Inventory (Edge Case: Stock update)
    for (const item of order.orderItems) {
      const result = await tx.productVariant.updateMany({
        where: { 
          id: item.variantId,
          stock: { gte: item.quantity } // Prevent negative stock at DB level
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (result.count === 0) {
        throw new Error(`Insufficient stock for ${item.productName || 'one of the items'}. Please contact support.`);
      }

      // Record Stock Transaction
      await tx.stockTransaction.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          quantity: -item.quantity,
          type: "SALE",
          reason: `Order #${order.id}`,
        },
      });
    }
  });

  // Fetch user to send email
  const orderDetails = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (orderDetails?.user?.email) {
    await sendOrderConfirmationEmail(
      orderDetails.user.email,
      orderDetails.user.name,
      orderDetails.id,
      orderDetails.totalAmount
    );
  }

  revalidatePath("/profile/orders");
  return { success: true };
}
