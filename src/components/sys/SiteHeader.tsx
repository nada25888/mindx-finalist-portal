import { useState } from "react";
import { Menu } from "lucide-react";
import { LogoBadge } from "./LogoBadge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "#top", label: "الرئيسية" },
  { href: "#apply", label: "التقديم" },
  { href: "#faq", label: "الأسئلة الشائعة" },
  { href: "#contact", label: "تواصل معانا" },
];

export function SiteHeader({ onLogoClick }: { onLogoClick?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-foreground/10 bg-navy-deep/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-18">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onLogoClick}
            aria-label="شعار SYS"
            className="rounded-2xl transition-smooth hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogoBadge size="sm" />
          </button>
          <div className="min-w-0 leading-tight">
            <p className="font-num text-sm font-bold text-navy-foreground">SYS</p>
            <p className="truncate text-xs text-navy-muted sm:text-sm">نظام التقديم والفرز الإلكتروني</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-navy-muted transition-smooth hover:bg-navy-foreground/10 hover:text-navy-foreground"
            >
              {n.label}
            </a>
          ))}
          <Button asChild size="sm" className="ms-2">
            <a href="#apply">سجّل الآن</a>
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="glass" size="icon" className="md:hidden" aria-label="القائمة">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-navy-soft bg-navy-deep text-navy-foreground">
            <SheetHeader className="text-start">
              <SheetTitle className="flex items-center gap-3 text-navy-foreground">
                <LogoBadge size="sm" />
                <span className="text-base">SYS · MindX</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1 px-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-semibold text-navy-muted transition-smooth hover:bg-navy-foreground/10 hover:text-navy-foreground"
                >
                  {n.label}
                </a>
              ))}
              <Button asChild className="mt-4">
                <a href="#apply" onClick={() => setOpen(false)}>
                  سجّل بياناتك الآن
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
