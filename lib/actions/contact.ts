"use client"; // Note: This will be changed to "use server" when creating the file.

import { Resend } from "resend";
import { z } from "zod";
import { AdminContactEmail } from "@/components/emails/admin-contact-email";
import { ClientContactEmail } from "@/components/emails/client-contact-email";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export async function sendContactEmail(data: ContactFormData) {
  "use server";

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
      from: "Yash Organics <onboarding@resend.dev>", // Replace with your verified domain in production
      to: env.ADMIN_EMAIL,
      subject: `New Inquiry from ${name}`,
      react: AdminContactEmail({ name, email, message }),
    });

    // 2. Send Confirmation Email to Client
    await resend.emails.send({
      from: "Yash Organics <onboarding@resend.dev>", // Replace with your verified domain in production
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
