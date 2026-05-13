import { Resend } from "resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
