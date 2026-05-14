import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");
  const phone = searchParams.get("phone");

  if (!orderId || !phone) {
    return NextResponse.json({ error: "Order ID and phone number are required" }, { status: 400 });
  }

  try {
    // We search by ID and the snapshot phone number stored in the order
    // This ensures tracking works even if the user changes their profile phone later
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productImages: { where: { isPrimary: true }, take: 1 }
              }
            },
            variant: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: Phone number must match the shipping phone in the order
    // We normalize both to prevent minor mismatch issues (whitespace/dashes)
    const normalizedInputPhone = phone.replace(/\D/g, "");
    const normalizedOrderPhone = (order.shippingPhone || "").replace(/\D/g, "");

    if (normalizedInputPhone !== normalizedOrderPhone) {
      return NextResponse.json({ error: "Order details do not match" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json({ error: "Failed to fetch order status" }, { status: 500 });
  }
}
