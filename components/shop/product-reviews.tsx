"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquarePlus, Sparkles, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified?: boolean;
  likes?: number;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews?: ReviewItem[];
}

export function ProductReviews({
  productId,
  productName,
  initialReviews = [],
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load persisted reviews from localStorage if any
  useEffect(() => {
    try {
      const storageKey = `yash_reviews_${productId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews((prev) => {
            const combined = [...parsed, ...prev];
            const unique = Array.from(new Map(combined.map((r) => [r.id, r])).values());
            return unique;
          });
        }
      }
    } catch {
      // LocalStorage not available or parse failure
    }
  }, [productId]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

  const ratingLabels: Record<number, string> = {
    1: "Needs Improvement",
    2: "Fair Experience",
    3: "Good & Natural",
    4: "Very Good Quality",
    5: "Exceptional / Loved It!",
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please provide your review feedback");
      return;
    }

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      rating,
      title: title.trim() || `${rating}-Star Experience`,
      comment: comment.trim(),
      createdAt: "Just now",
      verified: true,
      likes: 0,
    };

    setTimeout(() => {
      const updated = [newReview, ...reviews];
      setReviews(updated);
      try {
        localStorage.setItem(`yash_reviews_${productId}`, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }

      setIsSubmitting(false);
      setIsModalOpen(false);
      setName("");
      setTitle("");
      setComment("");
      setRating(5);

      toast.success("Thank you for your review!", {
        description: "Your honest thoughts help others choose pure, natural skincare.",
      });
    }, 400);
  };

  return (
    <section id="customer-reviews" className="pt-24 pb-16 scroll-mt-24 border-t border-border/40">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              Authentic Experiences
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground">
              Customer Reviews <span className="italic font-light">& Rituals</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Real reflections and results from those who made {productName} part of their daily self-care ritual.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto h-12 px-7 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold uppercase tracking-widest rounded-sm shadow-md flex items-center gap-2 group transition-all"
          >
            <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
            Write a Review
          </Button>
        </div>

        {/* Rating Breakdown Header / Zero-State Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 md:p-10 bg-secondary/[0.08] border border-border/60 rounded-sm">
          {/* Left: Overall Score */}
          <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left md:border-r md:border-border/60 md:pr-8 space-y-3">
            {totalReviews > 0 ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-serif font-medium text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground font-light">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.round(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-amber-200 fill-amber-100/40"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {totalReviews} verified {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider rounded-sm border border-emerald-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Fresh Release
                </div>
                <div className="flex items-center gap-1 text-amber-400/40 py-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 stroke-[1.5]" />
                  ))}
                </div>
                <h3 className="text-xl font-serif text-foreground">No Reviews Yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Be the very first customer to review this pure organic formulation!
                </p>
              </>
            )}
          </div>

          {/* Middle: Rating Distribution Bars */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2.5 md:pl-4">
            {[5, 4, 3, 2, 1].map((starCount) => {
              const countForStar = reviews.filter((r) => r.rating === starCount).length;
              const percentage = totalReviews > 0 ? (countForStar / totalReviews) * 100 : 0;

              return (
                <div key={starCount} className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="w-12 text-right font-medium">{starCount} Stars</span>
                  <div className="flex-1 h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-mono text-muted-foreground/80">
                    {countForStar}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List OR Premium Zero-Review Empty State */}
        {totalReviews === 0 ? (
          <div className="text-center py-20 px-6 border border-dashed border-border/80 rounded-sm bg-card/40 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/30 flex items-center justify-center text-primary/70">
              <Sparkles className="w-8 h-8 stroke-[1.2]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-serif text-foreground">
                Be the First to Share Your Experience
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Have you indulged in {productName}? Help our organic skincare community by sharing how it felt on your skin and the natural glow you noticed.
              </p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="h-11 px-8 text-xs font-bold uppercase tracking-widest border-primary/40 text-primary hover:bg-primary/5 rounded-sm"
            >
              Write First Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 md:p-8 bg-card border border-border/60 rounded-sm shadow-sm space-y-4 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-amber-200 fill-amber-100/40"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground/70">{rev.createdAt}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-foreground text-base">{rev.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center uppercase">
                        {rev.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{rev.name}</span>
                      {rev.verified && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 text-[9px] uppercase tracking-wider py-0 px-1.5 font-semibold border-none flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        toast.success("Thank you for your vote!");
                      }}
                      className="flex items-center gap-1 text-muted-foreground/70 hover:text-primary transition-colors text-[11px]"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[540px] p-6 sm:p-8 bg-background border-border/80">
          <DialogHeader className="space-y-2 text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/70">
              Share Your Ritual
            </span>
            <DialogTitle className="text-2xl md:text-3xl font-serif text-foreground">
              Review {productName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your honest feedback helps us nurture quality and empowers other conscious buyers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-6 pt-4">
            {/* Star Rating Picker */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-foreground">
                Your Rating
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        type="button"
                        key={starVal}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            active
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30 stroke-[1.5]"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-muted-foreground font-medium pl-2">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-foreground">
                Your Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-sm border-border/70 focus:border-primary"
              />
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-foreground">
                Review Headline
              </label>
              <Input
                placeholder="e.g. Cleanses deeply without drying"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-sm border-border/70 focus:border-primary"
              />
            </div>

            {/* Comment Area */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-foreground">
                Detailed Experience <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="How did this product feel? What results or changes did you observe after using it?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                className="rounded-sm border-border/70 focus:border-primary resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-7 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold uppercase tracking-widest rounded-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
