"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return [];
    }

    const notifications = await prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      throw new Error("Unauthorized");
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      throw new Error("Unauthorized");
    }

    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}
