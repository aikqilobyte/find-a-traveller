"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/create-post/create-post-modal";

export function CreatePostButton({ label = "Create a post" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> {label}
      </Button>
      <CreatePostModal open={open} onOpenChange={setOpen} />
    </>
  );
}
