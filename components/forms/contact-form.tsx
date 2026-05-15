"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { sendContactEmail } from "@/lib/mail";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const result = await sendContactEmail(data);
      if (result.success) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-border/50 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-foreground">
            Name
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className="w-full border-b border-border py-2 focus:outline-none focus:border-primary bg-transparent text-foreground placeholder:text-muted-foreground/50 transition-colors"
            placeholder="Your name"
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-foreground">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full border-b border-border py-2 focus:outline-none focus:border-primary bg-transparent text-foreground placeholder:text-muted-foreground/50 transition-colors"
            placeholder="Your email"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-foreground">
            Message
          </label>
          <textarea
            {...register("message")}
            id="message"
            rows={4}
            className="w-full border-b border-border py-2 focus:outline-none focus:border-primary bg-transparent resize-none text-foreground placeholder:text-muted-foreground/50 transition-colors"
            placeholder="How can we help you?"
          ></textarea>
          {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-none font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </div>
  );
}
