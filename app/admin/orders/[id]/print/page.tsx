import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { env } from "@/lib/env";
import { OrderPDFViewer } from "@/components/admin/order-pdf-viewer";

export const dynamic = 'force-dynamic';

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id === "" || typeof id === "undefined") {
    return notFound();
  }
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return notFound();
  }

  console.log(id)

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      orderItems: {
        include: {
          product: true,
          variant: true,
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return <OrderPDFViewer order={order} />;
}
