"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, AuthActionState } from "@/lib/actions/auth";
import { 
  Field, 
  FieldContent, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const initialState: AuthActionState = {};
  const [state, action, isPending] = useActionState(register, initialState);

  if (state.success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-12 bg-background border border-border/50 text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-4">Welcome to the Family</h2>
        <p className="text-muted-foreground mb-8">{state.message}</p>
        <Link href="/login" className="btn-minimal w-full inline-block pt-3">
          Login Now
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
        <h1 className="text-3xl font-serif mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground">Join Yash Organics for a natural lifestyle.</p>
      </div>

      <form action={action} className="space-y-5">
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <FieldContent>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
              aria-invalid={!!state.errors?.name}
            />
          </FieldContent>
          {state.errors?.name && <FieldError errors={[{ message: state.errors.name[0] }]} />}
        </Field>

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
          <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
          <FieldContent>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 00000 00000"
              required
              autoComplete="tel"
              aria-invalid={!!state.errors?.phone}
            />
          </FieldContent>
          {state.errors?.phone && <FieldError errors={[{ message: state.errors.phone[0] }]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              aria-invalid={!!state.errors?.password}
            />
          </FieldContent>
          {state.errors?.password && <FieldError errors={[{ message: state.errors.password[0] }]} />}
        </Field>

        {state.message && !state.success && (
          <p className="text-sm text-destructive text-center font-medium">{state.message}</p>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="btn-minimal w-full flex items-center justify-center mt-4"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Account"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="font-bold hover:text-primary transition-colors">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
