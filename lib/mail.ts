import { Resend } from "resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { VerifyOtpEmail } from "@/emails/verify-otp";
import { env } from "./env";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = env.NEXT_PUBLIC_SITE_URL;

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "Yash Organics <onboarding@resend.dev>", // Replace with your verified domain in production
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
      from: "Yash Organics <onboarding@resend.dev>", // Replace with your verified domain in production
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
      from: "Yash Organics <onboarding@resend.dev>", // Replace with your verified domain in production
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
