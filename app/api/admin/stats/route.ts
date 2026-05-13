import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalOrders, 
      totalRevenue, 
      totalCustomers, 
      totalProducts, 
      recentTransactions
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.stockTransaction.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true } },
          variant: { select: { name: true } }
        }
      })
    ]);

    // Fetch products with low stock (including variants)
    const lowStockProductsRaw = await prisma.product.findMany({
      where: {
        variants: { some: { stock: { lte: 10 } } }
      },
      include: {
        variants: true
      },
      take: 5,
    });

    // Format low stock data for UI
    const lowStockProducts = lowStockProductsRaw.map(p => {
      const variantWithLowStock = p.variants.find(v => v.stock <= 10);
      return {
        id: p.id,
        name: variantWithLowStock ? `${p.name} (${variantWithLowStock.name})` : p.name,
        stock: variantWithLowStock ? variantWithLowStock.stock : 0,
        unit: variantWithLowStock ? variantWithLowStock.unit : ""
      };
    }).sort((a, b) => a.stock - b.stock);

    // Fetch recent sales for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSales = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        paymentStatus: "PAID",
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalCustomers,
        totalProducts,
      },
      lowStockProducts,
      recentSales,
      recentTransactions
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
