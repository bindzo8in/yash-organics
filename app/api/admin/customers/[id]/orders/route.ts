import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/app/generated/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user;
    if(!user) return NextResponse.json({ error: "Unauthorized"}, { status: 403 });

    if ((user as any).role !== Role.ADMIN && (user as any).role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: customerId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const orders = await prisma.order.findMany({
      where: {
        userId: customerId,
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: true,
      }
    });

    let nextCursor: string | null = null;
    if (orders.length > limit) {
      const nextItem = orders.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({ orders, nextCursor });
  } catch (error) {
    console.error("Customer Orders API Error:", error);
    return NextResponse.json({ error: "Failed to fetch customer orders" }, { status: 500 });
  }
}
