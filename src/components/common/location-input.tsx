"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin, Plane } from "lucide-react";
import { searchLocations, type LocationOption } from "@/lib/locations";
import { cn } from "@/lib/utils";

export function LocationInput({
  name,
  value,
  onChange,
  placeholder,
  className,
  id,
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [touched, setTouched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const suggestions = useMemo<LocationOption[]>(
    () => (touched ? searchLocations(value) : []),
    [value, touched],
  );

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function select(option: LocationOption) {
    onChange(option.label);
    setOpen(false);
    setTouched(false);
  }

  const showList = open && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={inputId}
        name={name}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setTouched(true);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => {
          if (value) setTouched(true);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            select(suggestions[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary",
          className,
        )}
      />

      {showList && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg"
        >
          {suggestions.map((option, index) => (
            <li key={option.label} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => select(option)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm",
                  index === highlight ? "bg-primary/10" : "hover:bg-surface-muted",
                )}
              >
                {option.kind === "country" ? (
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Plane className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-foreground">{option.city ?? option.country}</span>
                  {option.city && <span className="text-muted-foreground">, {option.country}</span>}
                </span>
                {option.code && (
                  <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {option.code}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
