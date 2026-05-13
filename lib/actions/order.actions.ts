"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { razorpay } from "@/lib/razorpay";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { checkDeliveryAvailability } from "@/lib/services/delivery.service";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { clearDbCart } from "./cart.actions";

export async function createOrder(data: {
  addressId: string;
  cartItems: any[];
  totalAmount: number;
}) {
 try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");
 
   const { addressId, cartItems, totalAmount } = data;
 
   // 1. Validate Address
   const address = await prisma.address.findUnique({
     where: { id: addressId, userId: userId },
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
  
    // 3.5 Check for existing pending order with same content to prevent duplicates
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        addressId: addressId,
        totalAmount: finalAmount,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Only reuse orders from last 15 minutes
        }
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (existingOrder && existingOrder.razorpayOrderId) {
      // Compare items to ensure they are identical
      const existingItems = existingOrder.orderItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      })).sort((a, b) => a.variantId.localeCompare(b.variantId));

      const currentItems = validatedItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      })).sort((a, b) => a.variantId.localeCompare(b.variantId));

      const isSame = JSON.stringify(existingItems) === JSON.stringify(currentItems);

      if (isSame) {
        // Verify with Razorpay to ensure it's not already paid
        try {
          const rzpOrder = await razorpay.orders.fetch(existingOrder.razorpayOrderId);
          if (rzpOrder.status !== 'paid') {
            // Safe to reuse
            return {
              success: true,
              orderId: existingOrder.id,
              razorpayOrderId: existingOrder.razorpayOrderId,
              amount: Math.round(existingOrder.totalAmount * 100),
              currency: "INR",
            };
          }
        } catch (error) {
          console.error("Failed to fetch Razorpay order status:", error);
          // If fetch fails, fall through to create a new order to be safe
        }
      }
    }
 
   // 4. Create Razorpay Order
   const razorpayOrder = await razorpay.orders.create({
     amount: Math.round(finalAmount * 100), // In paise
     currency: "INR",
     receipt: `receipt_${Date.now()}`,
   });
 
   // 5. Save Order in DB with PENDING status
   const order = await prisma.order.create({
     data: {
       userId,
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
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = data;
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay key secret is missing");
    }

    // 1. Verify Razorpay Signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isSignatureValid = 
      expectedSignature.length === razorpaySignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpaySignature)
      );

    if (!isSignatureValid) {
      throw new Error("Invalid payment signature");
    }

    // 2. Fetch payment from Razorpay for extra safety
    const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

    if (razorpayPayment.status !== "captured") {
      throw new Error("Payment is not captured");
    }

    let newlyPaid = false;

    // 3. Update Order Status in Transaction
    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findFirst({
        where: { 
          id: orderId,
          userId, // Security: Ensure order belongs to user
        },
        include: { orderItems: true }
      });

      if (!existingOrder) throw new Error("Order not found");
      
      // Security: Verify order matches Razorpay record
      if (existingOrder.razorpayOrderId !== razorpayOrderId) {
        throw new Error("Razorpay order mismatch");
      }

      const expectedAmountInPaise = Math.round(existingOrder.totalAmount * 100);
      if (Number(razorpayPayment.amount) !== expectedAmountInPaise) {
        throw new Error("Payment amount mismatch");
      }

      if (razorpayPayment.currency !== "INR") {
        throw new Error("Payment currency mismatch");
      }

      // Atomic update: only update if it's currently PENDING.
      // This prevents race conditions where multiple requests try to verify the same payment.
      const updateResult = await tx.order.updateMany({
        where: { 
          id: existingOrder.id,
          paymentStatus: "PENDING"
        },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      // If count is 0, another request already processed this payment.
      if (updateResult.count === 0) return; 

      // Update Inventory
      // We do not check for stock >= quantity here because the payment is already captured.
      // If stock goes negative, it represents a backorder situation that admin must handle.
      // Throwing an error here would roll back the transaction and leave the order as PENDING.
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
            reason: `Order #${existingOrder.id}`,
          },
        });
      }
      
      // 3.4 Clear User's Database Cart after successful payment
      const cart = await tx.cart.findFirst({
        where: { userId }
      });
      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
      }

      newlyPaid = true;
    }, {
      maxWait: 5000, // default is 2000ms
      timeout: 10000, // default is 5000ms
    });

    // 4. Send email only once
    if (newlyPaid) {
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
    }

    revalidatePath("/profile/orders");
    return { success: true };
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}
