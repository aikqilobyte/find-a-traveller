"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@/lib/types/database";

export function CategoryCheckboxes({ categories }: { categories: Category[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {categories.map((category) => (
        <label key={category.id} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={selected.includes(category.id)}
            onCheckedChange={(checked) =>
              setSelected((prev) => (checked ? [...prev, category.id] : prev.filter((id) => id !== category.id)))
            }
          />
          {category.name}
          {selected.includes(category.id) && <input type="hidden" name="categoryIds" value={category.id} />}
        </label>
      ))}
    </div>
  );
}
