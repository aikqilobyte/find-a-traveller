import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: 30, text: "text-base" },
  md: { box: 38, text: "text-lg" },
  lg: { box: 48, text: "text-xl" },
} as const;

export function Logo({
  size = "md",
  showWordmark = true,
  onDark = false,
  href = "/",
  className,
}: {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  onDark?: boolean;
  href?: string | null;
  className?: string;
}) {
  const { box, text } = SIZES[size];

  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* The mark is artwork on a white ground, so it sits in a white disc —
          which reads as intentional on both light and navy surfaces. */}
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/5"
        style={{ width: box, height: box }}
      >
        <Image
          src="/logo-mark.png"
          alt="Find A Traveller"
          width={box}
          height={box}
          priority
          className="rounded-full object-contain"
          style={{ width: box, height: box }}
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold leading-none tracking-tight",
            text,
            onDark ? "text-white" : "text-navy",
          )}
        >
          Find A Traveller
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="shrink-0">
      {content}
    </Link>
  );
}
