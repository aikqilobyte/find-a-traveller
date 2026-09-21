"use client";

import { useTransition } from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/lib/actions/locale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, onDark = false }: { locale: Locale; onDark?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus:outline-none",
          onDark ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="Change language"
      >
        <Globe className="size-4" />
        <span>{LOCALE_LABELS[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => startTransition(() => setLocale(option).then(() => undefined))}
          >
            <Check className={cn("size-4", option === locale ? "opacity-100" : "opacity-0")} />
            {LOCALE_LABELS[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
