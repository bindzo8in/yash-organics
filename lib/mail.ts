"use server";

import { Resend } from "resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { VerifyOtpEmail } from "@/emails/verify-otp";
import { env } from "./env";
import { AdminContactEmail } from "@/components/emails/admin-contact-email";
import { ClientContactEmail } from "@/components/emails/client-contact-email";
import { ContactFormData, contactSchema } from "./validators/contact";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = env.NEXT_PUBLIC_SITE_URL;

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: `${env.NEXT_PUBLIC_SITE_NAME} <${env.NEXT_PUBLIC_EMAIL_ENGINE_MAIL}>`, // Replace with your verified domain in production
      to: email,
      subject: "Reset your Yash Organics password",
      react: ResetPasswordEmail({
        userFirstname: name,
        resetPasswordLink: resetLink,
      }),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

export const sendOrderConfirmationEmail = async (email: string, name: string, orderId: string, totalAmount: number) => {
  try {
    await resend.emails.send({
      from: `${env.NEXT_PUBLIC_SITE_NAME} <${env.NEXT_PUBLIC_EMAIL_ENGINE_MAIL}>`,
      to: email,
      subject: `Order Confirmation - #${orderId.slice(-6).toUpperCase()}`,
      react: OrderConfirmationEmail({
        userFirstname: name,
        orderId,
        totalAmount,
      }),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
};

export const sendOtpEmail = async (email: string, otp: string, name: string) => {
  try {
    const mail = await resend.emails.send({
     from: `${env.NEXT_PUBLIC_SITE_NAME} <${env.NEXT_PUBLIC_EMAIL_ENGINE_MAIL}>`,
      to: email,
      subject: "Verify your email address - Yash Organics",
      react: VerifyOtpEmail({
        userFirstname: name,
        otp,
      }),
    });

    if (mail.error) {
      console.error("Resend error:", mail.error);
      return { success: false, error: mail.error };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return { success: false, error };
  }
};

export async function sendContactEmail(data: ContactFormData) {

  const validatedFields = contactSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please check your inputs and try again.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, message } = validatedFields.data;

  try {
    // 1. Send Email to Admin
    await resend.emails.send({
       from: `${env.NEXT_PUBLIC_SITE_NAME} <${env.NEXT_PUBLIC_EMAIL_ENGINE_MAIL}>`,
      to: env.ADMIN_EMAIL,
      subject: `New Inquiry from ${name}`,
      react: AdminContactEmail({ name, email, message }),
    });

    // 2. Send Confirmation Email to Client
    await resend.emails.send({
       from: `${env.NEXT_PUBLIC_SITE_NAME} <${env.NEXT_PUBLIC_EMAIL_ENGINE_MAIL}>`,
      to: email,
      subject: "We've received your message - Yash Organics",
      react: ClientContactEmail({ name }),
    });

    return {
      success: true,
      message: "Thank you for reaching out! We've received your message.",
    };
  } catch (error) {
    console.error("Error sending contact email:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}