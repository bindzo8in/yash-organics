import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/app/generated/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    if( !user ) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    if ((user as any)?.role !== Role.ADMIN && (user as any)?.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const dateRange = searchParams.get("dateRange") || "all";

    // Date range filter
    let dateFilter = {};
    const now = new Date();
    if (dateRange === "7days") {
      dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === "30days") {
      dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    const users = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      skip: cursor ? 1 : 0, // Skip the cursor itself
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: {
            totalAmount: true,
            paymentStatus: true,
          }
        }
      }
    });

    let nextCursor: string | null = null;
    if (users.length > limit) {
      const nextItem = users.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    // Process orders into totalOrders and totalSpent
    const customers = users.map(user => {
      const successfulOrders = user.orders.filter(o => o.paymentStatus === "PAID");
      const totalSpent = successfulOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        totalOrders: successfulOrders.length,
        totalSpent: totalSpent,
      };
    });

    return NextResponse.json({ customers, nextCursor });
  } catch (error) {
    console.error("Customers API Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
