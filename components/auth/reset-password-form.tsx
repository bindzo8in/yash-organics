"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword, AuthActionState } from "@/lib/actions/auth";
import { 
  Field, 
  FieldContent, 
  FieldLabel 
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Loader2, ShieldCheck } from "lucide-react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const initialState: AuthActionState = {};
  const [state, action, isPending] = useActionState(resetPassword, initialState);

  if (state.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-12 bg-background border border-border/50 text-center"
      >
        <div className="flex justify-center mb-6">
          <ShieldCheck className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-4">Password Reset</h2>
        <p className="text-muted-foreground mb-8">
          {state.message}
        </p>
        <Link href="/login" className="btn-minimal w-full inline-block pt-3">
          Sign In
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
        <h1 className="text-3xl font-serif mb-2">New Password</h1>
        <p className="text-sm text-muted-foreground">Please choose a strong password for your account.</p>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="token" value={token} />

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <FieldContent>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
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
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Reset Password"}
        </button>
      </form>
    </motion.div>
  );
}
