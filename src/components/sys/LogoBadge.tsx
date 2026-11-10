import logo from "@/assets/sys-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-10 p-1",
  md: "size-12 p-1.5",
  lg: "size-20 p-2.5",
} as const;

export function LogoBadge({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl bg-card shadow-card ring-1 ring-border",
        sizes[size],
        className,
      )}
    >
      <img src={logo.url} alt="شعار SYS" className="size-full object-contain" />
    </span>
  );
}
