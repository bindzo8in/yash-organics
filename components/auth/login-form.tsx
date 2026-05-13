"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, AuthActionState } from "@/lib/actions/auth";
import { 
  Field, 
  FieldContent, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const initialState: AuthActionState = {};
  const [state, action, isPending] = useActionState(login, initialState);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-background border border-border/50"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">Please enter your details to sign in.</p>
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
              aria-invalid={!!state.errors?.email}
            />
          </FieldContent>
          {state.errors?.email && <FieldError errors={[{ message: state.errors.email[0] }]} />}
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link 
              href="/forgot-password" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <FieldContent>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              aria-invalid={!!state.errors?.password}
            />
          </FieldContent>
          {state.errors?.password && <FieldError errors={[{ message: state.errors.password[0] }]} />}
        </Field>

        {state.message && (
          <p className="text-sm text-destructive text-center font-medium">{state.message}</p>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="btn-minimal w-full flex items-center justify-center"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/register" className="font-bold hover:text-primary transition-colors">
          Create Account
        </Link>
      </div>
    </motion.div>
  );
}
