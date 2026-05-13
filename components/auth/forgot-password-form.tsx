"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword, AuthActionState } from "@/lib/actions/auth";
import { 
  Field, 
  FieldContent, 
  FieldLabel 
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Loader2, MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const initialState: AuthActionState = {};
  const [state, action, isPending] = useActionState(forgotPassword, initialState);

  if (state.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-12 bg-background border border-border/50 text-center"
      >
        <div className="flex justify-center mb-6">
          <MailCheck className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-4">Check Your Inbox</h2>
        <p className="text-muted-foreground mb-8">
          {state.message}
        </p>
        <Link href="/login" className="btn-minimal w-full inline-block pt-3">
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-background border border-border/50"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif mb-2">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a link to reset your password.</p>
      </div>

      <form action={action} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </FieldContent>
        </Field>

        {state.message && (
          <p className="text-sm text-destructive text-center font-medium">{state.message}</p>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="btn-minimal w-full flex items-center justify-center"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <Link href="/login" className="font-bold hover:text-primary transition-colors">
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
