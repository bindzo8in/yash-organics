"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { register, AuthActionState, verifyRegistrationOtp, resendOtp } from "@/lib/actions/auth";
import { 
  Field, 
  FieldContent, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const initialState: AuthActionState = {};
  const [state, action, isPending] = useActionState(register, initialState);
  const [otp, setOtp] = useState("");
  const [isVerifying, startVerify] = useTransition();
  const [isResending, startResend] = useTransition();
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    startVerify(async () => {
      const result = await verifyRegistrationOtp(state.email!, otp);
      if (result.success) {
        setIsVerified(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleResendOtp = () => {
    startResend(async () => {
      const result = await resendOtp(state.email!);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  if (isVerified) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-12 bg-background border border-border/50 text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-4">Account Verified</h2>
        <p className="text-muted-foreground mb-8">Your email has been successfully verified. You can now access your account.</p>
        <Link href="/login" className="btn-minimal w-full inline-block pt-3">
          Login Now
        </Link>
      </motion.div>
    );
  }

  if (state.requiresVerification) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-background border border-border/50"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-serif mb-2">Verify Email</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a 6-digit code to <span className="font-bold text-foreground">{state.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              Verification Code
            </label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isVerifying}
            className="btn-minimal w-full flex items-center justify-center"
          >
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (
              <>
                Verify Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={isResending || isVerifying}
            className="text-sm font-bold flex items-center justify-center w-full hover:text-primary transition-colors disabled:opacity-50"
          >
            {isResending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
            Resend Code
          </button>
        </div>
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
