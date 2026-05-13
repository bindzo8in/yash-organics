"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { sendPasswordResetEmail, sendOtpEmail } from "@/lib/mail";
import crypto from "crypto";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthActionState = {
  success?: boolean;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    password?: string[];
  };
};

export async function register(prevState: any, formData: FormData): Promise<AuthActionState> {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { name, email, phone, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return { message: "Email or phone already registered." };
      } else {
        // Clear previous unverified attempt to allow fresh start
        await prisma.user.delete({ where: { id: existingUser.id } });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: { 
          name, 
          email, 
          phone, 
          password: hashedPassword,
          isVerified: false,
          otp,
          otpExpires,
        },
      });

      const mail = await sendOtpEmail(email, otp, name);
      if (!mail.success) {
        // Using a specific error prefix to identify email failures
        throw new Error(`EMAIL_FAILURE: ${mail.error?.message || "Failed to send verification email."}`);
      }
    });

    return { 
      success: true, 
      requiresVerification: true,
      email,
      message: "Verification code sent to your email." 
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.message?.startsWith("EMAIL_FAILURE: ")) {
      const emailError = error.message.replace("EMAIL_FAILURE: ", "");
      return { 
        message: `We couldn't send your verification email. ${emailError}`
      };
    }

    return { message: "Something went wrong. Please try again." };
  }
}

export async function verifyRegistrationOtp(email: string, otp: string): Promise<AuthActionState> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { message: "User not found." };
    }

    if (user.isVerified) {
      return { message: "User is already verified." };
    }

    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return { message: "OTP has expired. Please request a new one." };
    }

    if (user.otp !== otp) {
      return { message: "Invalid verification code." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpires: null,
      }
    });

    return { success: true, message: "Email verified successfully. You can now login." };
  } catch (error) {
    console.error("OTP Verification error:", error);
    return { message: "Something went wrong. Please try again." };
  }
}

export async function resendOtp(email: string): Promise<AuthActionState> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { message: "User not found." };
    }

    if (user.isVerified) {
      return { message: "User is already verified." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          otp,
          otpExpires,
        }
      });

      const mail = await sendOtpEmail(email, otp, user.name);
      if (!mail.success) {
        throw new Error(`EMAIL_FAILURE: ${mail.error?.message || "Failed to resend verification code."}`);
      }
    });

    return { success: true, message: "A new verification code has been sent." };
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    
    if (error.message?.startsWith("EMAIL_FAILURE: ")) {
      const emailError = error.message.replace("EMAIL_FAILURE: ", "");
      return { 
        message: `Failed to resend code. ${emailError}`
      };
    }

    return { message: "Something went wrong." };
  }
}

export async function login(prevState: any, formData: FormData): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { message: "Please enter both email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.cause?.err?.message === "Email not verified") {
        return { 
          message: "Please verify your email address before logging in.",
          requiresVerification: true,
          email,
        };
      }
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid email or password." };
        default:
          return { message: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function forgotPassword(prevState: any, formData: FormData): Promise<AuthActionState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { message: "Please enter your email address." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal if user exists
      return { success: true, message: "If an account exists with this email, a reset link has been sent." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    await sendPasswordResetEmail(email, token, user.name);

    return { success: true, message: "A reset link has been sent to your email address." };
  } catch (error) {
    return { message: "Something went wrong. Please try again later." };
  }
}

export async function resetPassword(prevState: any, formData: FormData): Promise<AuthActionState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { message: "Invalid or missing reset token." };
  if (!password || password.length < 6) return { message: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { message: "Passwords do not match." };

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return { message: "The reset link is invalid or has expired." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { success: true, message: "Your password has been reset. You can now login." };
  } catch (error) {
    return { message: "Something went wrong. Please try again." };
  }
}
