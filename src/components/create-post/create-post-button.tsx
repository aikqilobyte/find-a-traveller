"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/create-post/create-post-modal";

export function CreatePostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Create a post
      </Button>
      <CreatePostModal open={open} onOpenChange={setOpen} />
    </>
  );
}
