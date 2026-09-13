"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/lib/actions/reviews";
import type { ActionResult } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/common/submit-button";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  bookingId,
  revieweeId,
  revieweeName,
}: {
  bookingId: string;
  revieweeId: string;
  revieweeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(async (prev, fd) => {
    const result = await createReview(prev, fd);
    if (result && "success" in result) setOpen(false);
    return result;
  }, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Leave a review for {revieweeName}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="revieweeId" value={revieweeId} />
          <input type="hidden" name="rating" value={rating} />

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)}>
                <Star className={cn("size-7", value <= rating ? "fill-warning text-warning" : "text-border")} />
              </button>
            ))}
          </div>

          <Textarea name="comment" placeholder="Share details of your experience" />

          {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}

          <SubmitButton className="w-full" pendingText="Submitting...">
            Submit Review
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
