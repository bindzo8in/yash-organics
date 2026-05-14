import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "New Password | Yash Organics",
  description: "Set a new password for your Yash Organics account.",
};

export default function ResetPasswordPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <ResetPasswordForm />
  </Suspense>;
}
