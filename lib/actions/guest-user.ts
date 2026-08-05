"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const GUEST_USER_COOKIE = "guest-user-id";

export async function getOrCreateCustomerUser(input?: { name?: string; email?: string; phone?: string }) {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, isGuest: false };
  }

  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(GUEST_USER_COOKIE)?.value;

  if (existingGuestId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: existingGuestId },
      select: { id: true },
    });

    if (existingUser) {
      return { userId: existingUser.id, isGuest: true };
    }
  }

  if (!input?.email || !input?.phone) {
    return null;
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedPhone = input.phone.trim();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    },
    select: { id: true },
  });

  if (existingUser) {
    cookieStore.set(GUEST_USER_COOKIE, existingUser.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return { userId: existingUser.id, isGuest: true };
  }

  const password = crypto.randomBytes(24).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  const guestUser = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: input.name?.trim() || "Guest Customer",
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: "CUSTOMER",
      isVerified: true,
    },
    select: { id: true },
  });

  cookieStore.set(GUEST_USER_COOKIE, guestUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { userId: guestUser.id, isGuest: true };
}

export async function setGuestCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

