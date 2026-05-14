import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { razorpay } from "@/lib/razorpay";
import { calculateDeliveryCharge } from "@/lib/delivery";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items, addressId } = await req.json(); // items: [{ productId, variantId, quantity }]

    if (!items || items.length === 0 || !addressId) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // 1. Fetch products and variants
    const productIds = items.map((i: any) => i.productId);
    const variantIds = items.map((i: any) => i.variantId).filter(Boolean);

    const [products, variants] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds } } }),
      prisma.productVariant.findMany({ where: { id: { in: variantIds } } }),
    ]);

    let subTotal = 0;
    let totalWeight = 0;

    const orderItemsData = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error(`Variant ${item.variantId} not found`);
      
      const itemPrice = variant.sellingPrice;
      const itemWeight = variant.weight || 0;

      subTotal += itemPrice * item.quantity;
      totalWeight += itemWeight * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        sellingPrice: itemPrice,
      };
    });

    // 2. Calculate Delivery Charge
    const deliveryCharge = calculateDeliveryCharge(subTotal, totalWeight);
    const finalAmount = subTotal + deliveryCharge;

    // 3. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // 4. Create Local Order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId,
        totalAmount: finalAmount,
        deliveryCharge,
        razorpayOrderId: razorpayOrder.id,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json({
      order,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: { 
          include: { 
            product: true,
            variant: true,
          } 
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
