import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export const metadata = {
  title: "Login | Yash Organics",
  description: "Sign in to your Yash Organics account.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md p-8 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
