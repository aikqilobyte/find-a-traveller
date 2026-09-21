"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Plane } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "travel",
    label: "I'm travelling",
    description: "Post your trip and the luggage space you have available.",
    icon: Plane,
    href: "/dashboard/posts/new/trip",
  },
  {
    value: "send",
    label: "I'm sending a package",
    description: "Post what you need delivered and where it needs to go.",
    icon: Package,
    href: "/dashboard/posts/new/package",
  },
] as const;

export function CreatePostModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selected, setSelected] = useState<(typeof OPTIONS)[number]["value"]>("travel");
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What do you want to post?</DialogTitle>
          <DialogDescription>Choose the type of post you want to create.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                selected === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-surface-muted",
              )}
            >
              <option.icon className={cn("mt-0.5 size-5", selected === option.value ? "text-primary" : "text-muted-foreground")} />
              <span>
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const option = OPTIONS.find((o) => o.value === selected)!;
              onOpenChange(false);
              router.push(option.href);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
